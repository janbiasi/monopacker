import { GraphResolutionEntry } from './graph';

export interface TargetGraph {
	resolution: GraphResolutionEntry;
	resolved: Pick<GraphResolutionEntry, 'internal' | 'remote'>;
	name: string;
}
