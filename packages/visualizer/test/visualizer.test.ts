import path from 'path';
import fse from 'fs-extra';
import { getPackageGraph } from '@monopacker/resolver';
import { getEChartsSeriesData } from '../src/echarts';
import { visualize } from '@monopacker/visualizer';

const OUT_DIR = path.resolve(__dirname, 'temp');
const FIXTURE_PATH = path.resolve(__dirname, 'fixture');

describe('visualizer', () => {
	beforeAll(async () => {
		await fse.mkdirp(OUT_DIR);
	});

	afterAll(async () => {
		// await fse.remove(OUT_DIR);
	});

	it('should generate data correctly', async () => {
		const graph = await getPackageGraph(FIXTURE_PATH, {
			externals: ['jquery'],
		});

		const data = await getEChartsSeriesData(
			{
				resolver: {
					externals: ['jquery'],
				},
				packs: [
					{
						source: '@project/app',
					},
				],
			},
			graph
		);

		expect(data.categories).toHaveLength(4);
		expect(data.nodes).toHaveLength(10);
		expect(data.links).toHaveLength(9);
	});

	it('should generate the visualizer files correctly', async () => {
		const graph = await getPackageGraph(FIXTURE_PATH, {
			externals: ['jquery'],
		});

		await visualize(
			{
				resolver: {
					externals: ['jquery'],
				},
				packs: [
					{
						source: '@project/app',
					},
				],
			},
			graph,
			OUT_DIR
		);
	});
});
