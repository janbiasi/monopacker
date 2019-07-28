import { resolve, join, isAbsolute } from 'path';
import { compile } from 'ejs';
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
import { fs, asyncForEach, rimraf, copyDir, matcher, execa, createIntegrityHash } from './utils';
import { Taper } from './Taper';
import { AdapterLerna } from './adapter';
import { useDebugHooks } from './helper/debug-hooks';
import { Folders, Files } from './const';

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

export const DEFAULT_PACKED_PATH = 'monopacked';

const MONOPACKER_INSTALLER_TEMPLATE = resolve(__dirname, 'templates', 'monopacker.installer.ejs');

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
		try {
			process.chdir(isAbsolute(this.cwd) ? this.cwd : resolve(process.cwd()));
		} catch (err) {
			throw new Error(`Couldn't change to provided cwd (maybe not found): ${err.message}`);
		}
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
	 * Create an internally, npm packable, mono package.
	 * This is used for internal dependencies of the main packable entry point.
	 */
	private async createPackableInternal(source: string, dest: string) {
		await fs.mkdirp(dest);
		const packageDef = await this.fetchPackage(resolve(source, 'package.json'));
		await copyDir(source, dest, {
			dereference: true,
			filter: filename => {
				if (filename.indexOf('node_modules') > -1) {
					return false;
				}

				return true;
			}
		});

		packageDef.dependencies = {};
		packageDef.devDependencies = {};

		await fs.writeFile(resolve(dest, 'package.json'), JSON.stringify(packageDef, null, 2));
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
		try {
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
		} catch (err) {
			throw err || 'Invalid packer configuration';
		}
	}

	/**
	 * Removes and/or re-creates the target folder including the .monopacker meta folder
	 */
	public async prepare(): Promise<void> {
		await rimraf(this.options.target);
		await fs.mkdirp(resolve(this.options.target, Folders.MONOPACKER));
	}

	/**
	 * Resets the packer instance and environment
	 */
	public teardown(): void {
		debug.disable();
		process.chdir(this.originalCwd);
	}

	/**
	 * Aggregates the needed bundle graph for packing the source application.
	 * Might be delivered from cache when running parallel processes, can be disabled
	 * in the options.
	 */
	public async analyze(dryRun: boolean = false): Promise<IAnalytics> {
		const everythingsAllright = await this.validate();
		if (!everythingsAllright) {
			throw new Error(`Invalid options provided, check if all paths exists`);
		}

		if (this.analyticsCache.has(this.options)) {
			return this.analyticsCache.get(this.options);
		}

		try {
			await this.taper.tap(HookPhase.PREANALYZE);
			if (dryRun === false) {
				// setup target structure
				await this.prepare();
			}

			const analytics = await this.adapter.analyze();

			// set integrity hash for checks
			(analytics as IAnalyticsWithIntegrity).integrity = createIntegrityHash(Packer.version, analytics);

			// rewrite internal dependency paths to non-absolute
			analytics.dependencies.internal = analytics.dependencies.internal.map(internalDep => ({
				...internalDep,
				location: internalDep.location.replace(this.options.cwd, '.')
			}));

			// tap and write analytics
			await this.taper.tap(HookPhase.POSTANALYZE, {
				analytics,
				dryRun,
				fromCache: false
			});
			if (dryRun === false) {
				await fs.writeFile(
					resolve(this.options.target, Folders.MONOPACKER, Files.ANALYTICS),
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
				scripts: sourcePkg.scripts || {},
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

			// pack all synthethic packages with the `npm pack` command
			let nativeNpmPackedArchiveList: string[] = [];
			let monopackerArchiveList: string[] = [];
			await asyncForEach(analytics.dependencies.internal, async lernaPkg => {
				const tempPackedPath = resolve(
					this.options.target,
					Folders.MONOPACKER,
					Folders.INTERNAL,
					lernaPkg.name.replace('/', '-').replace('@', '')
				);
				await this.createPackableInternal(lernaPkg.location, tempPackedPath);
				const { stdout } = await execa('npm', ['pack', tempPackedPath], {
					maxBuffer: 200_000_000
				});
				await rimraf(tempPackedPath);
				nativeNpmPackedArchiveList.push(stdout);
			});

			await asyncForEach(nativeNpmPackedArchiveList, async packedArchiveName => {
				const tarArchivePath = resolve(this.options.cwd, packedArchiveName);
				const targetTarArchivePath = resolve(this.options.target, Folders.MONOPACKER, packedArchiveName);
				// add relative path from target to the archive list
				monopackerArchiveList.push(targetTarArchivePath.replace(this.options.target, '.'));
				// copy tarball to .monopacker directory
				await fs.move(tarArchivePath, targetTarArchivePath);
				// remove old tarball in root directory (npm default, can't be overwritten :( ...)
				await fs.remove(tarArchivePath);
			});

			// write package definitions to a registry file
			await fs.writeFile(
				resolve(this.options.target, Folders.MONOPACKER, Files.REGISTRY),
				JSON.stringify(
					monopackerArchiveList.map(archivePath => archivePath.replace(this.options.target, '.')),
					null,
					2
				)
			);
			await this.taper.tap(HookPhase.POSTLINK, analytics.dependencies.internal);

			// create postinstall script for package tarballs
			if (monopackerArchiveList) {
				let installerScriptContent: string;

				if (this.options.createInstaller) {
					const installerTemplate = await fs.readFile(MONOPACKER_INSTALLER_TEMPLATE, 'utf-8');
					const installerCompiler = compile(installerTemplate, {
						async: true,
						cache: true
					});
					const installerContents = await installerCompiler({
						packages: monopackerArchiveList
					});
					await fs.writeFile(resolve(this.options.target, 'monopacker.installer.js'), installerContents);
					installerScriptContent = 'node ./monopacker.installer.js';
				} else {
					installerScriptContent = `npm i --ignore-scripts ${monopackerArchiveList.join(' ')}`;
				}

				if (artificalPackageInfo.scripts.postinstall && artificalPackageInfo.scripts.preinstall) {
					// send an info if both scripts are blocked by the user
					console.log('Warning: pre- and postinstall package scripts are already in use,');
					console.log('         please make sure you provide your own strategy for installation.');
				} else if (artificalPackageInfo.scripts.postinstall && !artificalPackageInfo.scripts.preinstall) {
					// we use pre-install if post-install is already in use
					artificalPackageInfo.scripts.preinstall = installerScriptContent;
				} else if (!artificalPackageInfo.scripts.postinstall) {
					// we use post-install if available
					artificalPackageInfo.scripts.postinstall = installerScriptContent;
				}
			}

			// create artificial target package.json
			await fs.writeFile(
				join(this.options.target, 'package.json'),
				JSON.stringify(artificalPackageInfo, null, 2)
			);

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
