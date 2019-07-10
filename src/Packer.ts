import { resolve, join, isAbsolute } from 'path';
import { createHash } from 'crypto';
import { IPackerOptions, Package, HookPhase, IAnalytics, LernaPackageList, DependenciesLike, ILernaPackageListEntry, IAdapter } from './types';
import { fs, getLernaPackages, extractDependencies, asyncForEach, pkg, rimraf, copyDir, matcher, execa } from './utils';
import { Taper } from './Taper';
import { AdapterLerna } from './adapter/Lerna';
import { Adapter } from './adapter/Adapter';

const neededCopySettings = [
	'**',
	'!node_modules',
	'!package.json',
]

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

export class Packer {
	public static version = pkg.version;

	// taping injection
	private taper: Taper<HookPhase, IPackerOptions['hooks']>;
	// adapter for analytics
	private adapter: IAdapter;

	// caching maps for better performance
	private packageCache = new Map<string, Package>();
	private analyticsCache = new WeakMap<IPackerOptions, IAnalytics>();
	private packedPackageCache = new WeakMap<Packer, Package>();

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
		options.target = this.resolvePath(options.target);
		// verify copy options
		options.copy = options.copy
			? neededCopySettings.concat(options.copy)
			: defaultCopySettings;
		// set current working directory to cwd
		process.chdir(this.cwd);
		// tape initialization
		this.taper.tap(HookPhase.INIT);
	}

	private get hooks(): IPackerOptions['hooks'] {
		return this.options.hooks || {};
	}

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

	private async fetchSourcePackage(): Promise<Package> {
		const sourcePkgPath = join(this.options.source, 'package.json');

		try {
			return await this.fetchPackage(sourcePkgPath);
		} catch (err) {
			throw new Error(err.message);
		}
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
	 * Fetch all lerna packages from the defined cwd
	 */
	public async getLernaPackages(): Promise<LernaPackageList> {
		try {
			return await getLernaPackages(this.cwd);
		} catch (err) {
			throw new Error(`Failed to fetch lerna packages: ${err.message}`);
		}
	}

	/**
	 * Removes and/or re-creates the target folder
	 */
	public async prepare(): Promise<void> {
		await rimraf(this.options.target);
		await fs.mkdirp(this.options.target);
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
			throw new Error(`Failed command execution ${command} ${args.join(' ')} (in source)`);
		}

	}

	/**
	 * Runs a certain shell command inside the target directory
	 * @param {string} command
	 * @param {string[]} args
	 */
	public async runInTarget(command: string, args?: string[]) {
		try {
			return await execa(command, args, {
				cwd: this.options.target
			});
		} catch (err) {
			throw new Error(`Failed command execution ${command} ${args.join(' ')} (in target)`);
		}
	}

	/**
	 * Aggregates the needed bundle graph for packing the source application.
	 * Might be delivered from cache when running parallel processes, can be disabled
	 * in the options.
	 */
	public async analyze(): Promise<IAnalytics> {
		if (this.analyticsCache.has(this.options)) {
			return this.analyticsCache.get(this.options);
		}

		try {
			await this.taper.tap(HookPhase.PREANALYZE);
			await this.prepare();
			const analytics = await this.adapter.analyze();

			// tap and write analytics
			await this.taper.tap(HookPhase.POSTANALYZE, analytics);
			await fs.writeFile(
				resolve(this.options.target, 'monopacker.analytics.json'),
				JSON.stringify(analytics, null, 2)
			);

			return analytics;
		} catch (err) {
			throw new Error(`Failed to aggregate analytics: ${err.message}`);
		}
	}

	public async pack() {
		try {
			const analytics = await this.analyze();
			const sourcePkg = await this.fetchSourcePackage();

			// build artifical package.json file
			const artificalPackageInfo = this.packedPackageCache.get(this) || {
				name: `${sourcePkg.name}-packed`,
				version: sourcePkg.version || '0.0.0',
				description: sourcePkg.description || '',
				monopacker: {
					hash: createHash('sha256').update(JSON.stringify(analytics)).digest('hex'),
					version: Packer.version,
					linked: analytics.dependencies.internal.reduce((prev, { name, version }) => ({
						...prev,
						[name]: version
					}), {})
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
			await copyDir(this.options.source, this.options.target, {
				dereference: true,
				filter: fileName => {
					return this.options.copy.map(filter => matcher.isMatch(fileName, filter)).every(v => v === true);
				}
			});
			await this.taper.tap(HookPhase.POSTCOPY);

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
			await this.taper.tap(HookPhase.PRECOPY, analytics.dependencies.internal);
			await asyncForEach(analytics.dependencies.internal, async lernaPkg => {
				const syntheticModulePath = resolve(this.options.target, 'node_modules', lernaPkg.name);
				await fs.mkdirp(syntheticModulePath);
				await copyDir(lernaPkg.location, syntheticModulePath);
			});
			await this.taper.tap(HookPhase.POSTCOPY, analytics.dependencies.internal);
			await this.taper.tap(HookPhase.PACKED, this);
		} catch (err) {
			throw new Error(`Failed to pack (source: ${this.options.source})`);
		}
	}
}
