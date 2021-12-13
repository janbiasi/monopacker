import fse from 'fs-extra';
import { resolve } from 'path';
import { run } from '../src/run';

const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const FIXTURES_RESET_DIR = resolve(__dirname, '.restore-fixtures');
const FIXTURES_TEST_DIR = resolve(__dirname, '.out');
const getFixturePath = (name: string) => resolve(FIXTURES_DIR, name);

describe('run', () => {
	beforeEach(() => {
		fse.copySync(FIXTURES_DIR, FIXTURES_RESET_DIR);
	});

	afterEach(() => {
		fse.copySync(FIXTURES_DIR, FIXTURES_TEST_DIR);

		fse.removeSync(FIXTURES_DIR);
		fse.copySync(FIXTURES_RESET_DIR, FIXTURES_DIR);
		fse.removeSync(FIXTURES_RESET_DIR);
	});

	it('should fail if no config is present', async () => {
		await expect(() => run(getFixturePath('empty'))).rejects.toThrow();
	});

	it('should work', async () => {
		await run(getFixturePath('project-alpha'));
	});
});
