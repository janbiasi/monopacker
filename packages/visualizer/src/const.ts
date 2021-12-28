export interface Node {
	id: string;
	name: string;
	symbolSize: number;
	value: string;
	category?: number;
	symbol?: string;
}

export interface Link {
	source: string;
	target: string;
}

export enum NodeCategory {
	INTERNAL = 0,
	DEPENDENCY = 1,
	EXTERNAL = 2,
	ENTRYPOINT = 3,
}

/**
 * @see https://echarts.apache.org/en/option.html#series-line.data.symbol
 */
export const mapNodeCategoryToSymbol: Record<NodeCategory, string | undefined> = {
	[NodeCategory.INTERNAL]: 'roundRect',
	[NodeCategory.DEPENDENCY]: 'circle',
	[NodeCategory.EXTERNAL]: 'circle',
	[NodeCategory.ENTRYPOINT]: 'pin',
};

/**
 * @see https://echarts.apache.org/en/option.html#series-line.data.symbolSize
 */
export const mapNodeCategoryToSize: Record<NodeCategory, number> = {
	[NodeCategory.INTERNAL]: 17,
	[NodeCategory.DEPENDENCY]: 15,
	[NodeCategory.EXTERNAL]: 12,
	[NodeCategory.ENTRYPOINT]: 30,
};

export const nodeCategories = [
	{
		// NodeCategory.INTERNAL => 0
		name: 'Internal Dependency',
	},
	{
		// NodeCategory.DEPENDENCY => 1
		name: 'Dependency',
	},
	{
		// NodeCategory.EXTERNAL => 2
		name: 'External Dependency',
	},
	{
		// NodeCategory.ENTRYPOINT => 3
		name: 'Pack Entrypoint',
	},
];
