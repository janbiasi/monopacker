import { join } from "path";
import { Adapter } from "./Adapter";
import { getLernaPackages, asyncForEach, extractDependencies, fs } from "../utils";
import { LernaPackageList, DependenciesLike, IAnalytics, Package } from "../types";

export class AdapterLerna extends Adapter {
	private packageCache = new Map<string, Package>();

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
			throw new Error(err.message);
		}
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

	public async analyze(): Promise<IAnalytics> {
		try {
			const sourcePkg = await this.fetchSourcePackage();
			const lernaPkgs = await this.getLernaPackages();
			const internalPackageNames = lernaPkgs.map(pkg => pkg.name);
			// aggregation of installable external dependencies
			const requiredProductionDeps = extractDependencies(sourcePkg.dependencies, dependency => {
				return internalPackageNames.indexOf(dependency) === -1;
			});
			// aggregation of internal dependencies
			const requiredInternalDeps = extractDependencies(sourcePkg.dependencies, dependency => {
				return internalPackageNames.indexOf(dependency) > -1;
			});
			const internalDependencyNames = Object.keys(requiredInternalDeps);
			const internalDependencies = lernaPkgs.filter(({ name }) => {
				if (name === sourcePkg.name) {
					// skip self
					return false;
				}
				// skip unneeded
				return internalDependencyNames.indexOf(name) > -1;
			});

			// aggregating and building graph for sub-modules
			const peer: DependenciesLike = {};
			const graph: IAnalytics['graph'] = {};
			await asyncForEach(internalDependencies, async ({ name, location }) => {
				const subPkg = await this.fetchPackage(`${location}/package.json`);
				const installablePeers = extractDependencies(subPkg.dependencies, dependency => {
					if (dependency === sourcePkg.name) {
						// skip self
						return false;
					}

					// skip internals atm.
					return internalPackageNames.indexOf(dependency) === -1;
				});

				// building graph and peers
				Object.assign(graph, {
					[subPkg.name]: installablePeers
				});
				Object.assign(peer, installablePeers);
			});

			const result = {
				dependencies: {
					external: requiredProductionDeps,
					internal: internalDependencies,
					peer
				},
				graph
			};

			return result;
		} catch (err) {
			throw new Error(`Failed to aggregate analytics: ${err.message}`);
		}
	}
}
