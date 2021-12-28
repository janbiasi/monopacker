import type { Config } from '@monopacker/config';
import type { Graph } from '@monopacker/resolver';
import { Link, mapNodeCategoryToSize, mapNodeCategoryToSymbol, Node, nodeCategories, NodeCategory } from './const';

export const getEChartsSeriesData = (config: Pick<Config, 'packs' | 'resolver'>, graph: Graph) => {
	const categories = nodeCategories;
	const entrypointIds = config.packs.map((pack) => pack.source);
	const nodes: Node[] = [];
	const links: Link[] = [];

	const nodeAlreadyExists = (id: string) => nodes.some((node) => node.id === id);

	for (const localPackageName in graph.local) {
		const nodeCategory = entrypointIds.includes(localPackageName) ? NodeCategory.ENTRYPOINT : NodeCategory.INTERNAL;

		if (!nodeAlreadyExists(localPackageName)) {
			nodes.push({
				id: localPackageName,
				name: localPackageName,
				symbolSize: mapNodeCategoryToSize[nodeCategory],
				value: `${graph.local[localPackageName].version} at ${graph.local[localPackageName].path}`,
				category: nodeCategory,
				symbol: mapNodeCategoryToSymbol[nodeCategory],
			});
		}
	}

	for (const packageName in graph.resolution) {
		// TODO: How should we visualize peer deps?
		const { external, internal, remote } = graph.resolution[packageName];

		// all external packages
		for (const externalPackageName of external) {
			if (!nodeAlreadyExists(externalPackageName)) {
				nodes.push({
					id: externalPackageName,
					name: externalPackageName,
					symbolSize: mapNodeCategoryToSize[NodeCategory.EXTERNAL],
					value: '(external)',
					category: NodeCategory.EXTERNAL,
					symbol: mapNodeCategoryToSymbol[NodeCategory.EXTERNAL],
				});
			}

			links.push({
				source: packageName,
				target: externalPackageName,
			});
		}

		for (const internalPeerPackage in internal) {
			// we already have all local packages in the nodes array, we only need
			// to add the specific connection here
			links.push({
				source: packageName,
				target: internalPeerPackage,
			});
		}

		for (const remotePackage in remote) {
			if (!nodeAlreadyExists(remotePackage)) {
				nodes.push({
					id: remotePackage,
					name: remotePackage,
					symbolSize: mapNodeCategoryToSize[NodeCategory.DEPENDENCY],
					value: remote[remotePackage],
					category: NodeCategory.DEPENDENCY,
					symbol: mapNodeCategoryToSymbol[NodeCategory.DEPENDENCY],
				});
			}

			links.push({
				source: packageName,
				target: remotePackage,
			});
		}
	}

	return {
		categories,
		nodes,
		links,
	};
};
