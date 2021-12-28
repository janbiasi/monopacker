import { resolve } from 'path';
import { getPackageGraph } from '../src/graph';
import { resolveTargetGraph } from '../src/resolve';

const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const getFixturePath = (name: string) => resolve(FIXTURES_DIR, name);

describe('resolve', () => {
	describe('resolveTargetGraph', () => {
		describe('fixture: alpha', () => {
			const fixturePath = getFixturePath('project-alpha');

			it('should resolve target tree correctly', async () => {
				const graph = await getPackageGraph(fixturePath);
				const { resolution } = resolveTargetGraph(graph, '@project-alpha/app');
				expect(resolution).toMatchInlineSnapshot(`
			Array [
			  "@project-alpha/app",
			]
		`);
			});
		});
	});
});
