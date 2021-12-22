import { PackageDependencyMap } from './package';
// import { GraphResolutionEntry } from './graph';

export interface TargetGraph {
	resolution: string[];
	internals: PackageDependencyMap;
	name: string;
}
