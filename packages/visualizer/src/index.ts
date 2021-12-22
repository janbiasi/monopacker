import path from 'path';
import { promises as fs } from 'fs';
import type { Config } from '@monopacker/config';
import type { Graph } from '@monopacker/resolver';
import { getEChartsSeriesData } from './echarts';

const TEMPLATE_FILE = path.resolve(__dirname, 'template.html');
const OUTPUT_NAME = 'monopacker-graph';

export const visualize = async (
	config: Pick<Config, 'packs' | 'resolver'>,
	graph: Graph,
	targetDir: string = process.cwd()
) => {
	let template = await fs.readFile(TEMPLATE_FILE, 'utf8');
	const data = await getEChartsSeriesData(config, graph);

	template = template.replace('{{NODES}}', JSON.stringify(data.nodes));
	template = template.replace('{{LINKS}}', JSON.stringify(data.links));
	template = template.replace('{{CATEGORIES}}', JSON.stringify(data.categories));

	await fs.writeFile(path.resolve(targetDir, `${OUTPUT_NAME}.html`), template);
	await fs.writeFile(path.resolve(targetDir, `${OUTPUT_NAME}.json`), JSON.stringify(data, null, 2));
};
