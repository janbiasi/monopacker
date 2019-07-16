import { resolve, join, isAbsolute } from 'path';
import debug from 'debug';
import {
	IPackerOptions,
	Package,
	HookPhase,
	IAnalytics,
	DependenciesLike,
	IAdapter,
	ArtificalPackage,
	IAnalyticsWithIntegrity
} from './types';
import {
	fs,
	asyncForEach,
	pkg,
	rimraf,
	copyDir,
	matcher,
	execa,
	displayPath,
	createHash,
	createIntegrityHash
} from './utils';
import { Taper } from './Taper';
import { AdapterLerna } from './adapter';
import { useDebugHooks } from './helper/debug-hooks';

const neededCopySettings = ['**', '!node_modules', '!package.json'];

const defaultCopySettings = [
	...neededCopySettings,
	'!.editorconfig',
	'!.gitignore',
	'!.nvmrc',
	'!.node-version',
	'!.npmrc',
	'!**.md',
	'!tsconfig*.json'
];

export const DEFAULT_PACKED_PATH = 'packed';

export class Packer {
	public static version: string = '1';

	// taping injection
	private taper: Taper<HookPhase, Required<IPackerOptions['hooks']>>;
	// adapter for analytics
	private adapter: IAdapter;

	// caching maps for better performance
	private packageCache = new Map<string, Package>();
	private analyticsCache = new WeakMap<IPackerOptions, IAnalytics>();
	private packedPackageCache = new WeakMap<Packer, ArtificalPackage>();

	// backups
	private originalCwd = process.cwd();

	constructor(private options: IPackerOptions) {
		// create taper for packer
		this.taper = new Taper(this, this.hooks);
		// use provided or set default adapter, TODO: auto-detect
		this.adapter = options.adapter
			? new options.adapter(this.cwd, this.options)
			: new AdapterLerna(this.cwd, this.options);
		// set cache by default to true
		options.cache = options.cache === false ? false : true;
		// verify correct paths from cwd setting
		options.source = this.resolvePath(options.source);
		options.target = this.resolvePath(options.target || DEFAULT_PACKED_PATH);
		// verify copy options
		options.copy = options.copy ? neededCopySettings.concat(options.copy) : defaultCopySettings;
		// enable debugging if needed
		if (options.debug) {
			debug.enable('packer');
			this.taper.stream(new Taper(this, useDebugHooks(options)));
		}
		// set current working directory to cwd
		process.chdir(isAbsolute(this.cwd) ? this.cwd : resolve(process.cwd()));
		// tape initialization
		this.taper.tap(HookPhase.INIT);
	}

	/**
	 * Returns the hooks object safely
	 */
	private get hooks(): IPackerOptions['hooks'] {
		return this.options.hooks || ({} as IPackerOptions['hooks']);
	}

	/**
	 * Returns the current working directory
	 */
	private get cwd(): string {
		return this.options.cwd || process.cwd();
	}

	/**
	 * Read the contents of a package.json file,
	 * pass the path for reading the file (async).
	 * @param {string} packagePath
	 */
	private async fetchPackage(packagePath: string): Promise<Package> {
		if (this.packageCache.has(packagePath)) {
			return Promise.resolve(this.packageCache.get(packagePath));
		}

		try {
			const rawPackageInfo = await fs.readFile(packagePath);
			const packageInfo = JSON.parse((rawPackageInfo || '{}').toString());
			this.packageCache.set(packagePath, packageInfo);

			return packageInfo;
		} catch (err) {
			this.packageCache.delete(packagePath);
			throw new Error(err.message);
		}
	}

	/**
	 * Fetches the source package via `fetchPackage`
	 */
	private async fetchSourcePackage(): Promise<Package> {
		const sourcePkgPath = join(this.options.source, 'package.json');

		try {
			return await this.fetchPackage(sourcePkgPath);
		} catch (err) {
			throw new Error(err.message);
		}
	}

	/**
	 * Subscribe to packer taper instance
	 * @param {Taper<HookPhase, THooks>}
	 * @typeparam THooks defines hook type
	 */
	public subscribe<THooks extends IPackerOptions['hooks']>(taper: Taper<HookPhase, Required<THooks>>) {
		this.taper.stream(taper);
	}

	/**
	 * Resolves a path in the defined cwd (options) if not absolute.
	 * @param {string} partial
	 */
	public resolvePath(partial: string): string {
		if (isAbsolute(partial)) {
			return partial;
		}

		return resolve(this.cwd, partial);
	}

	/**
	 * Validates the current environment
	 */
	public async validate(): Promise<boolean> {
		const sourceExists = await fs.pathExists(this.options.source);
		const sourcePkgExists = await fs.pathExists(resolve(this.options.source, 'package.json'));

		const sourcesExists = sourceExists && sourcePkgExists;
		if (!sourcesExists) {
			throw `Missing sources, please check if ${this.options.source} and ${this.options.source}/package.json exists`;
		}

		const adapterValidationResult = await this.adapter.validate();
		if (sourcesExists && adapterValidationResult.valid) {
			return true;
		}

		throw adapterValidationResult.message || 'Invalid packer configuration';
	}

	/**
	 * Removes and/or re-creates the target folder
	 */
	public async prepare(): Promise<void> {
		await rimraf(this.options.target);
		await fs.mkdirp(this.options.target);
	}

	/**
	 * Resets the packer instance and environment
	 */
	public async teardown(): Promise<void> {
		debug.disable();
		process.chdir(this.originalCwd);
	}

	/**
	 * Runs a certain shell command inside the source directory
	 * @param {string} command
	 * @param {string[]} args
	 */
	public async runInSource(command: string, args: string[]) {
		try {
			return await execa(command, args, {
				cwd: this.options.source
			});
		} catch (err) {
			throw new Error(
				`Failed command execution ${command} ${args.join(' ')}: ${err.message} (in source ${displayPath(
					this.cwd,
					this.options.source
				)})`
			);
		}
	}

	/**
	 * Runs a certain shell command inside the target directory
	 * @param {string} command
	 * @param {string[]} args
	 */
	public async runInTarget(command: string, args: string[] = []) {
		try {
			return await execa(command, args, {
				cwd: this.options.target
			});
		} catch (err) {
			throw new Error(
				`Failed command execution ${command} ${args.join(' ')}: ${err.message} (in target ${displayPath(
					this.cwd,
					this.options.target
				)})`
			);
		}
	}

	/**
	 * Aggregates the needed bundle graph for packing the source application.
	 * Might be delivered from cache when running parallel processes, can be disabled
	 * in the options.
	 */
	public async analyze(generateAnalyticsFile: boolean = true): Promise<IAnalytics> {
		const everythingsAllright = await this.validate();
		if (!everythingsAllright) {
			throw new Error(`Invalid options provided, check if all paths exists`);
		}

		if (this.analyticsCache.has(this.options)) {
			return this.analyticsCache.get(this.options);
		}

		try {
			await this.taper.tap(HookPhase.PREANALYZE);
			await this.prepare();
			const analytics = await this.adapter.analyze();

			// set integrity hash for checks
			(analytics as IAnalyticsWithIntegrity).integrity = createIntegrityHash(Packer.version, analytics);

			// tap and write analytics
			await this.taper.tap(HookPhase.POSTANALYZE, {
				analytics,
				generateAnalyticsFile,
				fromCache: false
			});
			if (generateAnalyticsFile) {
				await fs.writeFile(
					resolve(this.options.target, 'monopacker.analytics.json'),
					JSON.stringify(analytics, null, 2)
				);
			}

			return analytics;
		} catch (err) {
			throw new Error(`Failed to aggregate analytics: ${err.message}`);
		}
	}

	/**
	 * Main pack method which aggregates analytics, builds artificial package file,
	 * copies local submodules and all the other magic.
	 */
	public async pack() {
		try {
			const analytics = await this.analyze();
			const sourcePkg = await this.fetchSourcePackage();

			// build artifical package.json file
			const artificalPackageInfo: ArtificalPackage = this.packedPackageCache.get(this) || {
				name: `${sourcePkg.name}-packed`,
				version: sourcePkg.version || '0.0.0',
				description: sourcePkg.description || '',
				monopacker: {
					// push hash for integrity checks
					hash: (analytics as IAnalyticsWithIntegrity).integrity,
					// reference packer version
					version: Packer.version,
					// common NPM tree out of lerna packages
					linked: analytics.dependencies.internal.reduce(
						(prev, { name, version }) => ({
							...prev,
							[name]: version
						}),
						{} as DependenciesLike
					)
				},
				dependencies: {
					...analytics.dependencies.external, // main prod. dependencies
					...analytics.dependencies.peer // dependencies of submodules
				}
			};

			// enable caching of aggregated data for packing process
			if (!this.packedPackageCache.has(this)) {
				this.packedPackageCache.set(this, artificalPackageInfo);
			}

			// copy all source files by options
			await this.taper.tap(HookPhase.PRECOPY);
			const copiedFiles: string[] = [];
			await copyDir(this.options.source, this.options.target, {
				dereference: true,
				filter: fileName => {
					const doesMatchCriteria = this.options.copy
						.map(filter => matcher.isMatch(fileName, filter))
						.every(v => v === true);

					if (doesMatchCriteria) {
						copiedFiles.push(fileName);
					}

					return doesMatchCriteria;
				}
			});
			await this.taper.tap(HookPhase.POSTCOPY, copiedFiles);

			// create artificial target package.json
			await fs.writeFile(
				join(this.options.target, 'package.json'),
				JSON.stringify(artificalPackageInfo, null, 2)
			);

			// install production dependencies
			await this.taper.tap(HookPhase.PREINSTALL, artificalPackageInfo);
			await this.runInTarget('npm', ['install']);
			await this.taper.tap(HookPhase.POSTINSTALL, artificalPackageInfo);

			// copy symlinked sub-modules
			await this.taper.tap(HookPhase.PRELINK, analytics.dependencies.internal);
			await asyncForEach(analytics.dependencies.internal, async lernaPkg => {
				const syntheticModulePath = resolve(this.options.target, 'node_modules', lernaPkg.name);
				await fs.mkdirp(syntheticModulePath);
				await copyDir(lernaPkg.location, syntheticModulePath);
			});
			await this.taper.tap(HookPhase.POSTLINK, analytics.dependencies.internal);

			// finalize
			await this.teardown();
			await this.taper.tap(HookPhase.PACKED, {
				analytics,
				copiedFiles,
				artificalPackage: artificalPackageInfo
			});
		} catch (err) {
			// simply show any child error on failure
			throw err;
		}
	}
}
