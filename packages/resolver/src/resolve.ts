import { logger } from './logger';
import { Graph } from './types/graph';
import { PackageJson, PackageDependencyMap } from './types/package';
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
 * We want to know every internal dependency even if they are nested deeply in N packages plus we also
 * want to abort further processing if we detect unexpected cyclic dependencies.
 *
 * Example resolve cases:
 * - App -> A + B should resolve  A and B
 * - App -> A + B -> C should resolve A, B and C
 * - App -> A -> B -> C should resolve A, B and C
 * - App -> A -> B -> C -> A should throw an error (cyclic dependency)
 *
 * @param {string[]} currentResolutionPath - The package resolution graph which represents the dependency chain
 * @param {PackageDependencyMap} dependenciesToResolve - The dependencies which we want to resolve
 * @param {PackageDependencyMap} destinationTree - The final dependency tree which we want to populate
 * @param {Graph} mainRepoGraph - The main package resolution graph of the current project
 *
 * @returns {string[], PackageDependencyMap} - The final resolution chain and the destination tree
 */
function resolveDeepInternalDependencies(
	currentResolutionPath: string[],
	dependenciesToResolve: PackageDependencyMap,
	destinationTree: PackageDependencyMap,
	mainRepoGraph: Graph
): [string[], PackageDependencyMap] {
	for (const dependency in dependenciesToResolve) {
		const currentInternalPeerDependencies = mainRepoGraph.resolution[dependency].internal;

		/**
		 * If we detect that a dependency is already in the target tree, we know that there's
		 * something wrong with the source package graphs and we should stop further execution
		 * anyway instead of doing some "black box magic"
		 */
		if (destinationTree.hasOwnProperty(dependency)) {
			throw new Error(
				`Cycling dependency "${dependency}" detected (resolution: ${currentResolutionPath.join(' -> ')})`
			);
		}

		logger.debug(
			`Resolving internal dependency "${dependency}" (resolution: ${currentResolutionPath.join(' -> ')})`
		);

		// always patch current dependency into destination tree (direct resolution)
		destinationTree[dependency] = dependenciesToResolve[dependency];

		if (Object.keys(currentInternalPeerDependencies).length === 0) {
			// no peer internals found for currentd dependency, skipping
			logger.debug(`No peer internals found for "${dependency}" (parent: ${currentResolutionPath.join(' -> ')})`);
			continue;
		}

		logger.debug(`Found peer internals for "${dependency}" (parent: ${currentResolutionPath.join(' -> ')})`);

		const [recursiveResolutionChain, recursiveDependencies] = resolveDeepInternalDependencies(
			[...currentResolutionPath, dependency],
			currentInternalPeerDependencies,
			destinationTree,
			mainRepoGraph
		);

		// TODO: maybe we need to check for parent scope compatibility issues when resolving circular dependencies

		currentResolutionPath.push(`${recursiveResolutionChain.join(' -> ')}`);
		destinationTree = {
			...destinationTree,
			...recursiveDependencies,
		};
	}

	return [currentResolutionPath, destinationTree];
}

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

	const [resolution, internals] = resolveDeepInternalDependencies(
		[targetPackageName],
		graph.resolution[targetPackageName].internal,
		{},
		graph
	);

	return {
		resolution,
		internals,
		name: targetPackageName,
	};
}
