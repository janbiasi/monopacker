import { resolve, join } from 'path';
import { Packer } from '../src/Packer';
import { fs } from '../src/utils';
import { HookPhase } from '../src/types';

// hack to not provide this as option.cwd in packer ctor
process.chdir(resolve(__dirname, 'fixtures/basic'));

const TEMP = resolve(__dirname, 'temp');

const createTestPacker = (hooks?: Packer['hooks']) =>
	new Packer({
		source: 'packages/main',
		target: TEMP,
		hooks
	});

describe('Packer', () => {
	describe('Lerna', () => {
		it('should aggregate any analytics', async () => {
			const packer = createTestPacker();
			const analytics = await packer.analyze();
			expect(analytics).toBeDefined();
			expect(analytics).toMatchSnapshot();
		});

		it('should generate a monopacker.analytics.json file', async () => {
			const packer = createTestPacker();
			const analytics = await packer.analyze();
			expect(analytics).toMatchSnapshot();
			const validateAnalyticsOutput = () => {
				const contents = fs.readFileSync(resolve(TEMP, 'monopacker.analytics.json'), 'utf8');
				expect(contents).toBeDefined();
			};
			expect(validateAnalyticsOutput).not.toThrow();
			validateAnalyticsOutput();
			try {
				const contents = fs.readFileSync(resolve(TEMP, 'monopacker.analytics.json'), 'utf8');
				expect(contents).toBeDefined();
				const deserialized = JSON.parse(contents);
				expect(deserialized).toBeTruthy();
				expect(deserialized).toMatchSnapshot();
				expect(deserialized.dependencies.external).toBeDefined();
				expect(deserialized.dependencies.internal).toBeDefined();
				expect(deserialized.dependencies.peer).toBeDefined();
				expect(deserialized.dependencies.internal.length).toEqual(1);
				expect(deserialized.dependencies.peer.smallest).toBeDefined();
			} catch (err) { }
		});

		it('should generate an artificial package correctly', async () => {
			const packer = createTestPacker();
			await packer.pack();
			const generatedPkg = require(join(TEMP, 'package.json'));
			expect(generatedPkg).toBeTruthy();
			expect(generatedPkg).toMatchSnapshot();
			expect(generatedPkg.name).toEqual('@fixture/main-packed');
			expect(generatedPkg.dependencies).toStrictEqual({
				debug: '*',
				smallest: '1.0.1'
			});
		});

		it('should copy the source files correctly', async () => {
			const packer = createTestPacker();
			await packer.pack();
			const contents = require(join(TEMP, 'src', 'test.js'));
			expect(contents).toEqual('Hello world');
		});

		it('should copy sub-modules correctly', async () => {
			const fakeHook = jest.fn(async () => Promise.resolve());
			const packer = createTestPacker({
				[HookPhase.INIT]: [fakeHook],
				[HookPhase.PACKED]: [fakeHook],
				[HookPhase.POSTANALYZE]: [fakeHook],
				[HookPhase.POSTCOPY]: [fakeHook],
				[HookPhase.POSTINSTALL]: [fakeHook],
				[HookPhase.PREANALYZE]: [fakeHook],
				[HookPhase.PRELINK]: [fakeHook],
				[HookPhase.POSTLINK]: [fakeHook],
				[HookPhase.PRECOPY]: [fakeHook],
				[HookPhase.PREINSTALL]: [fakeHook]
			});
			await packer.pack();
			expect(fakeHook).toBeCalledTimes(10);
		});

		it('should install all external modules', async () => {
			const packer = createTestPacker();
			await packer.pack();

			const debugExists = await fs.pathExists(resolve(TEMP, 'node_modules', 'debug'));
			expect(debugExists).toBe(true);

			const msExists = await fs.pathExists(resolve(TEMP, 'node_modules', 'ms'));
			expect(msExists).toBe(true);

			const smallestExists = await fs.pathExists(resolve(TEMP, 'node_modules', 'smallest'));
			expect(smallestExists).toBe(true);

			const arrayExists = await fs.pathExists(resolve(TEMP, 'node_modules', 'to-array'));
			expect(arrayExists).toBe(true);
		});

		it('should install all internal modules', async () => {
			const packer = createTestPacker();
			await packer.pack();

			const baseFolderExists = await fs.pathExists(resolve(TEMP, 'node_modules', '@fixture'));
			expect(baseFolderExists).toBe(true);

			const subModuleExists = await fs.pathExists(resolve(TEMP, 'node_modules', '@fixture', 'sub'));
			expect(subModuleExists).toBe(true);

			expect(require(resolve(TEMP, 'node_modules', '@fixture', 'sub', 'src', 'index.js'))).toEqual(
				'Hello from sub'
			);
		});

		it('should generate correct metadata for the packed bundle', async () => {
			const packer = createTestPacker();
			await packer.pack();
			const generatedPkg = require(join(TEMP, 'package.json'));
			expect(generatedPkg).toBeDefined();
			expect(generatedPkg.monopacker).toBeDefined();
			expect(generatedPkg.monopacker).toMatchSnapshot();
		});

		it('should generate a hash for the packed bundle', async () => {
			const packer = createTestPacker();
			await packer.pack();
			const generatedPkg = require(join(TEMP, 'package.json'));
			expect(generatedPkg).toBeDefined();
			expect(generatedPkg.monopacker).toBeDefined();
			expect(generatedPkg.monopacker.hash).toBeDefined();
			expect(generatedPkg.monopacker.hash.length).toBeGreaterThan(0);
			expect(generatedPkg.monopacker.hash).toMatchSnapshot();
		});
	});
});
