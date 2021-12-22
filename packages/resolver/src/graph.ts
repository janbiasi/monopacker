import type { ResolverConfig } from '@monopacker/config';
import type { Graph, GraphResolutionEntry } from './types/graph';
import type { PackageJson } from './types/package';
import { parsePackages } from './package';
import { searchPackages } from './search';
import { resolve } from 'path';

/**
 * Aggregate resolutions of dependencies for a single package, based on a list of other internal packages.
 * TODO: Respect semver ranges for each internal package
 * @param pkg
 * @param internalPkgNames
 * @returns
 * @private
 */
export function getPackageResolutions(
	pkg: PackageJson,
	internalPkgNames: string[],
	config: ResolverConfig = {}
): GraphResolutionEntry {
	const dependencies = pkg.dependencies || {};
	const peerDependencies = pkg.peerDependencies || {};
	const explicitExternals = config.externals || [];
	const includePeers = config.includePeers === false ? false : true;

	const resolutions: GraphResolutionEntry = {
		internal: {},
		external: [],
		remote: {},
		peer: {},
	};

	for (const dependency in dependencies) {
		if (explicitExternals.includes(dependency)) {
			resolutions.external.push(dependency);
			continue;
		}

		if (internalPkgNames.includes(dependency)) {
			// internal dependency, should be packed locally
			resolutions.internal[dependency] = dependencies[dependency];
		} else {
			// normal dependency, set as remote
			resolutions.remote[dependency] = dependencies[dependency];
		}
	}

	for (const peerDependency in peerDependencies) {
		resolutions.peer[peerDependency] = peerDependencies[peerDependency];

		if (explicitExternals.includes(peerDependency)) {
			resolutions.external.push(peerDependency);
			continue;
		}

		if (internalPkgNames.includes(peerDependency)) {
			// internal peers should always be packed, even if not explicitly specified via `config.resolver.includePeers`
			resolutions.internal[peerDependency] = peerDependencies[peerDependency];
		} else {
			// other peers should be defined as normal prod dependency
			// TODO: this should not happen, this would be a developer's mistake
			if (!resolutions.remote[peerDependency] && includePeers) {
				resolutions.remote[peerDependency] = peerDependencies[peerDependency];
			}
		}
	}

	return resolutions;
}

/**
 * Get the main graph for all packages in the repository
 * @param rootDir
 * @param config
 * @returns
 */
export async function getPackageGraph(rootDir: string, config: ResolverConfig = {}): Promise<Graph> {
	const packagePaths = await searchPackages(rootDir, config);
	const packages = parsePackages(packagePaths.map((packagePath) => resolve(rootDir, packagePath)));
	const graph: Graph = {
		local: {},
		resolution: {},
	};

	// 1. build local graph to know which packages exist locally
	for (const { pkg, location } of packages) {
		if (graph.local[pkg.name]) {
			throw new Error(
				`Duplicate package "${pkg.name}" detected at ${location}, unable to resolve internals correctly`
			);
		}

		graph.local[pkg.name] = {
			version: pkg.version,
			path: location,
		};
	}

	const internalPackageNames = Object.keys(graph.local);

	// 2. build resolution graph based on known package
	for (const { pkg } of packages) {
		graph.resolution[pkg.name] = getPackageResolutions(pkg, internalPackageNames, config);
	}

	return graph;
}
