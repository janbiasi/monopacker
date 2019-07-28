import { join, resolve } from 'path';
import { Adapter } from './Adapter';
import { getLernaPackages, asyncForEach, extractDependencies, fs, findDuplicatesInArray } from '../utils';
import { DependenciesLike, IAnalytics, Package, LernaPackageList } from '../types';

interface ILernaPackageInfo {
	packages: LernaPackageList;
	names: string[];
}

interface ILernaCircularGraph {
	[name: string]: string[];
}

interface ILernaResolvedTree {
	internal: LernaPackageList;
	external: DependenciesLike;
	graph: IAnalytics['graph'];
}

export class AdapterLerna extends Adapter {
	private packageCache = new Map<string, Package>();
	private lernaPackagesCache = new Map<string, LernaPackageList>();

	/**
	 * Fetch required meta information for processing
	 */
	private async getLernaPackagesInfo() {
		const packages = await this.getLernaPackages();
		const names = packages.map(pkg => pkg.name);

		return { packages, names };
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
	 * Fetch the main package of the packable entry
	 */
	private async fetchSourcePackage(): Promise<Package> {
		const sourcePkgPath = join(this.options.source, 'package.json');

		try {
			return await this.fetchPackage(sourcePkgPath);
		} catch (err) {
			throw new Error('Could not fetch source package');
		}
	}

	/**
	 * Detect possible circular dependencies which will lead to an error in
	 * the pack and/or analyze step.
	 */
	private async findCircularDependencies(): Promise<void> {
		const { names, packages } = await this.getLernaPackagesInfo();
		const lernaPkgDefs = await Promise.all(
			packages.map(async pkg => {
				return await this.fetchPackage(resolve(pkg.location, 'package.json'));
			})
		);
		const circularGraph = lernaPkgDefs.reduce(
			(prev, curr) => ({
				...prev,
				[curr.name]: Object.keys(extractDependencies(curr.dependencies, dep => names.indexOf(dep) > -1))
			}),
			{} as ILernaCircularGraph
		);

		Object.keys(circularGraph).forEach(packageEntry => {
			const internalDeps = circularGraph[packageEntry];
			internalDeps.forEach(internalLinkedDependency => {
				if (circularGraph[internalLinkedDependency]) {
					if (circularGraph[internalLinkedDependency].indexOf(packageEntry) > -1) {
						throw new Error(
							`${packageEntry} relies on ${internalLinkedDependency} and vice versa, please fix this circular dependency`
						);
					}
				}
			});
		});
	}

	/**
	 * Recursive aggregation of internal dependencies
	 */
	private async resolveDependantInternals(
		graph: IAnalytics['graph'] = {},
		sourcePackage: Package,
		lernaPackageInfo: ILernaPackageInfo
	): Promise<ILernaResolvedTree> {
		// aggregation of installable external dependencies
		const productionDependencies = extractDependencies(sourcePackage.dependencies, dependency => {
			return lernaPackageInfo.names.indexOf(dependency) === -1;
		});
		// aggregation of internal dependencies
		const internalPackageNames = lernaPackageInfo.packages.map(pkg => pkg.name);
		const requiredInternalDeps = extractDependencies(sourcePackage.dependencies, dependency => {
			return internalPackageNames.indexOf(dependency) > -1 && dependency !== sourcePackage.name;
		});
		const internalDependencyNames = Object.keys(requiredInternalDeps);
		const internalDependencies = lernaPackageInfo.packages.filter(({ name }) => {
			if (name === sourcePackage.name) {
				// skip self
				return false;
			}
			// skip unneeded
			return internalDependencyNames.indexOf(name) > -1;
		});

		// check if the related module(s) also need to be resolved and do so
		const recuriveModules = await Promise.all<ILernaResolvedTree>(
			internalDependencies.map(async entry => {
				const childModulePkg = await this.fetchPackage(resolve(entry.location, 'package.json'));
				return await this.resolveDependantInternals(graph, childModulePkg, lernaPackageInfo);
			})
		);

		// format recursive output according to type definition
		const recursiveInternals = recuriveModules.reduce(
			(prev, curr) => [...prev, ...curr.internal],
			[] as LernaPackageList
		);
		const recursiveExternals = recuriveModules.reduce(
			(prev, curr) => ({ ...prev, ...curr.external }),
			{} as DependenciesLike
		);

		// create resolved map
		const resolved: Pick<ILernaResolvedTree, 'internal' | 'external'> = {
			internal: internalDependencies.concat(recursiveInternals),
			external: { ...productionDependencies, ...recursiveExternals }
		};

		// build related graph from recursive modules
		graph[sourcePackage.name] = {
			internal: resolved.internal.reduce(
				(prev, { name, version }) => ({ ...prev, [name]: version }),
				{} as DependenciesLike
			),
			external: recursiveExternals
		};

		return {
			...resolved,
			graph
		};
	}

	/**
	 * Fetch all lerna packages from the defined cwd
	 */
	public async getLernaPackages(): Promise<LernaPackageList> {
		if (this.lernaPackagesCache.has(this.cwd)) {
			return this.lernaPackagesCache.get(this.cwd);
		}

		try {
			const res = await getLernaPackages(this.cwd);
			this.lernaPackagesCache.set(this.cwd, res);
			return res;
		} catch (err) {
			throw new Error(`Failed to fetch lerna packages: ${err.message}`);
		}
	}

	/**
	 * Pre-validation process
	 */
	public async validate() {
		// find duplicate package names
		try {
			const { names } = await this.getLernaPackagesInfo();
			const duplicates = findDuplicatesInArray(names);

			if (duplicates.length > 0) {
				return {
					valid: false,
					message: `Duplicate package names found: ${duplicates.join(', ')}`
				};
			}
		} catch (err) {
			return {
				valid: false,
				message: `${err}`
			};
		}

		// find any circular dependencies in the tree
		try {
			await this.findCircularDependencies();
		} catch (err) {
			return {
				valid: false,
				message: `${err}`
			};
		}

		// everything's fine
		return { valid: true };
	}

	/**
	 * Main analytics process
	 */
	public async analyze(): Promise<IAnalytics> {
		const { valid, message } = await this.validate();
		if (!valid) {
			throw new Error(message || `Invalid configuration found, check the docs for correct usage`);
		}

		// main analytics cycle
		try {
			const peer: DependenciesLike = {};
			const rootGraph: IAnalytics['graph'] = {};
			const sourcePkg = await this.fetchSourcePackage();
			const { packages, names } = await this.getLernaPackagesInfo();

			// aggregation of installable external dependencies
			const requiredDirectProductionDeps = extractDependencies(sourcePkg.dependencies, dependency => {
				return names.indexOf(dependency) === -1;
			});
			// aggregation of internal dependencies
			const { internal /*, external*/, graph } = await this.resolveDependantInternals(rootGraph, sourcePkg, {
				packages,
				names
			});

			// aggregating and building graph for sub-modules
			await asyncForEach(internal, async ({ location }) => {
				const subPkg = await this.fetchPackage(`${location}/package.json`);
				const installablePeers = extractDependencies(subPkg.dependencies, dependency => {
					if (dependency === sourcePkg.name) {
						// skip self
						return false;
					}
					// skip internals atm.
					return names.indexOf(dependency) === -1;
				});
				// building graph and peers
				Object.assign(graph, {
					[subPkg.name]: installablePeers
				});
				Object.assign(peer, installablePeers);
			});

			const result = {
				dependencies: {
					external: requiredDirectProductionDeps,
					internal: internal,
					peer
				},
				graph: rootGraph
			};

			return result;
		} catch (err) {
			throw new Error(`${err || 'Analyzing failed'}`);
		}
	}
}
