import { resolve } from 'path';
import { getConfig } from '../src/resolve';

const FIXTURES_DIR = resolve(__dirname, 'fixtures');

const getFixtureRootDir = (name: string) => resolve(FIXTURES_DIR, name);

describe('resolve', () => {
	it('should resolve a dedicated valid config correctly', async () => {
		const [config] = await getConfig(getFixtureRootDir('dedicated-file-valid'));
		expect(config).toBeTruthy();
		expect(config).toMatchSnapshot();
	});

	it('should resolve a package.json config correctly', async () => {
		const [config] = await getConfig(getFixtureRootDir('package-valid'));
		expect(config).toBeTruthy();
		expect(config).toMatchSnapshot();
	});
});
