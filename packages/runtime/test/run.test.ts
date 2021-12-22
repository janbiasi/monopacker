import fse from 'fs-extra';
import { join, resolve } from 'path';
import { run } from '../src/run';

const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const FIXTURES_RESET_DIR = resolve(__dirname, '.restore-fixtures');
// const FIXTURES_TEST_DIR = resolve(__dirname, '.out');
const getFixturePath = (name: string) => resolve(FIXTURES_DIR, name);

describe('run', () => {
	beforeEach(() => {
		fse.copySync(FIXTURES_DIR, FIXTURES_RESET_DIR);
	});

	afterEach(() => {
		// fse.copySync(FIXTURES_DIR, FIXTURES_TEST_DIR);

		fse.removeSync(FIXTURES_DIR);
		fse.copySync(FIXTURES_RESET_DIR, FIXTURES_DIR);
		fse.removeSync(FIXTURES_RESET_DIR);
	});

	it('should fail if no config is present', async () => {
		await expect(() => run(getFixturePath('empty'))).rejects.toThrow();
	});

	it('should work with direct internal dependencies (Entry -> (A + B) = A + B)', async () => {
		await run(getFixturePath('project-alpha'));
		// TODO: Add expect statements regarding output tree
	});

	it('should work with indirect internal dependencies (Entry -> A -> B = A + B)', async () => {
		const fixturePath = getFixturePath('project-beta');

		// main execution
		await run(fixturePath);

		const pkgJson = await fse.readFile(join(fixturePath, 'packed/project-app/package.json'));
		expect(pkgJson).toBeDefined();

		const pkg = JSON.parse(pkgJson.toString());
		expect(pkg).toBeDefined();

		expect(pkg.bundledDependencies).toHaveLength(2);
		expect(pkg.bundledDependencies).toContain('@project/package-a');
		expect(pkg.bundledDependencies).toContain('@project/package-b');

		expect(pkg.dependencies['@project/package-a']).toEqual('./packages/project-package-a-1.0.0.tgz');
		expect(pkg.dependencies['@project/package-b']).toEqual('./packages/project-package-b-1.0.0.tgz');
		expect(pkg.dependencies.typescript).toEqual('4.5.4');

		await expect(
			fse.pathExists(resolve(fixturePath, 'packed/project-app', pkg.dependencies['@project/package-a']))
		).resolves.toEqual(true);

		await expect(
			fse.pathExists(resolve(fixturePath, 'packed/project-app', pkg.dependencies['@project/package-b']))
		).resolves.toEqual(true);

		expect(pkg.monopackerMeta.resolution).toEqual(['@project/app', '@project/app -> @project/package-a']);

		expect(pkg.monopackerMeta.perf.main).toBeGreaterThanOrEqual(0);
		expect(pkg.monopackerMeta.perf.tars).toBeGreaterThanOrEqual(0);
		expect(pkg.monopackerMeta.perf.copy).toBeGreaterThanOrEqual(0);
	});

	it('should fail with circular internal dependencies (Entry -> A -> B -> C -> A = Error)', async () => {
		await expect(() => run(getFixturePath('project-gamma'))).rejects.toThrow(
			'Cycling dependency "@project/package-a" detected (resolution: @project/app -> @project/package-a -> @project/package-b -> @project/package-c)'
		);
	});
});
