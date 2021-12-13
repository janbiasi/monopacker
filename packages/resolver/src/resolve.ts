import { Graph, GraphResolutionEntry } from './types/graph';
import { PackageJson } from './types/package';
import { TargetGraph } from './types/target-graph';

export function resolveTargetPackageName(target: string, localPackageNames: string[]) {
	let targetPackageName: string | undefined;

	if (localPackageNames.includes(target)) {
		targetPackageName = target;
	} else {
		try {
			const targetPackage: PackageJson = require(target);
			if (targetPackage && targetPackage.name) {
				targetPackageName = targetPackage.name;
			}
		} catch (err) {
			// Silently ignore, we'll check if the target is a local package later
		}
	}

	return targetPackageName;
}

/**
 * Get the target resolution graph for a certain application within the current repository.
 * @param {string} rootDir - Root directory of the repository
 * @param {Config} config - Main monopacker configuration
 * @param {string} target - Target package name or path to the app which should get packed
 */

/**
 * Get the target resolution for a certain application within the graph.
 * @param {Graph} graph - The current repository graph
 * @param {string} target - Target package name or path to the app which should get packed
 * @returns {TargetGraph} - The target resolution graph
 */
export function resolveTargetGraph(graph: Graph, target: string): TargetGraph {
	const localPackageNames = Object.keys(graph.local);
	const targetPackageName = resolveTargetPackageName(target, localPackageNames);

	if (!targetPackageName) {
		throw new Error(`Could not resolve target package "${target}", available are: ${localPackageNames.join(', ')}`);
	}

	if (!graph.resolution[targetPackageName] || Object.keys(graph.resolution[targetPackageName]).length === 0) {
		throw new Error(`Target package "${target}" does not have any dependencies, monopacker will have no effect`);
	}

	const resolution = graph.resolution[targetPackageName];
	const resolved: TargetGraph['resolved'] = {
		internal: resolution.internal,
		remote: resolution.remote
	};

	for (const internalPkgName in resolution.internal) {
		const internalPkgRef = graph.local[internalPkgName];
		const internalPkg = graph.resolution[internalPkgName];

		if (!internalPkgRef) {
			throw new Error(
				`Could not co-locate internal package "${internalPkgName}" during resolution of "${targetPackageName}"`
			);
		}

		resolved.remote = {
			...resolved.remote,
			...(internalPkg.remote || {})
		};
	}

	return {
		resolution,
		resolved,
		name: targetPackageName
	};
}
