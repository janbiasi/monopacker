import type { PackageDependencyMap } from './package';

export interface GraphResolutionEntry {
	internal: PackageDependencyMap;
	external: string[];
	remote: PackageDependencyMap;
	peer: PackageDependencyMap;
}

/**
 * The main graph aggregarted by the resolver. This is the base
 * of all actions ran by the packing process.
 */
export interface Graph {
	local: {
		[packageName: string]: {
			path: string;
			version: string;
		};
	};
	resolution: {
		[packageName: string]: GraphResolutionEntry;
	};
}
