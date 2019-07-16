import { resolve, join } from 'path';
import { Packer } from '../src/Packer';
import { fs, rimraf } from '../src/utils';
import { HookPhase, IAnalytics, IAnalyticsWithIntegrity } from '../src/types';

// hack to not provide this as option.cwd in packer ctor
const BASIC_CWD = resolve(__dirname, 'fixtures/basic');
const CYCLICAL_CWD = resolve(__dirname, 'fixtures/cyclical');
const MULTITREE_CWD = resolve(__dirname, 'fixtures/multitree');
const DUPLICATES_CWD = resolve(__dirname, 'fixtures/duplicates');
const INVALID_CWD = resolve(__dirname, 'fixtures/duplicates');

const createTestPackerFor = (cwd: string, source: string, hooks?: Packer['hooks']) =>
	new Packer({
		cwd,
		source,
		target: resolve(cwd, 'temp'),
		hooks
	})

const createTestPackerForBasic = (hooks?: Packer['hooks']) =>
	createTestPackerFor(BASIC_CWD, 'packages/main', hooks);

const createTestPackerForcyclical = (hooks?: Packer['hooks']) =>
	createTestPackerFor(CYCLICAL_CWD, 'packages/a', hooks);

const createTestPackerForMultitree = (hooks?: Packer['hooks']) =>
	createTestPackerFor(MULTITREE_CWD, 'packages/c', hooks);

const createTestPackerForDuplicates = (hooks?: Packer['hooks']) =>
	createTestPackerFor(DUPLICATES_CWD, 'packages/main', hooks);

const createTestPackerToGalaxy = (hooks?: Packer['hooks']) =>
	createTestPackerFor(INVALID_CWD, 'packages/does-not-exist', hooks);

const analyticsToSnapshot = (analytics: IAnalytics) => {
	return {
		...analytics,
		dependencies: {
			...analytics.dependencies,
			internal: analytics.dependencies.internal.map(entry => ({
				name: entry.name,
				version: entry.version,
				description: entry.description,
				private: entry.private
			}))
		}
	};
};

describe('Packer', () => {
	describe('Lerna', () => {
		it('should fail on not found validation', async () => {
			const packer = createTestPackerToGalaxy();
			const willFailDueNotFound = async () => {
				try {
					await packer.validate();
				} catch (err) {
					throw new Error(err);
				}
			};

			await expect(willFailDueNotFound()).rejects.toThrow();

			try {
				await willFailDueNotFound();
			} catch (err) {
				expect(`${err}`.indexOf('Missing sources, please check if') > -1);
			}
		});
		it('should aggregate any analytics', async () => {
			const packer = createTestPackerForBasic();
			const analytics = await packer.analyze();
			expect(analytics).toBeDefined();
			expect(analyticsToSnapshot(analytics)).toMatchSnapshot();
		});

		it('should generate a monopacker.analytics.json file', async () => {
			const packer = createTestPackerForBasic();
			const analytics = await packer.analyze();
			expect(analyticsToSnapshot(analytics)).toMatchSnapshot();
			const validateAnalyticsOutput = () => {
				const contents = fs.readFileSync(resolve(BASIC_CWD, 'temp', 'monopacker.analytics.json'), 'utf8');
				expect(contents).toBeDefined();
			};
			expect(validateAnalyticsOutput).not.toThrow();
			validateAnalyticsOutput();
			try {
				const contents = fs.readFileSync(resolve(BASIC_CWD, 'temp', 'monopacker.analytics.json'), 'utf8');
				expect(contents).toBeDefined();
				const deserialized = JSON.parse(contents);
				expect(deserialized).toBeTruthy();
				expect(analyticsToSnapshot(deserialized)).toMatchSnapshot();
				expect(deserialized.dependencies.external).toBeDefined();
				expect(deserialized.dependencies.internal).toBeDefined();
				expect(deserialized.dependencies.peer).toBeDefined();
				expect(deserialized.dependencies.internal.length).toEqual(1);
				expect(deserialized.dependencies.peer.smallest).toBeDefined();
			} catch (err) { }
		});

		it('should generate an artificial package correctly', async () => {
			const packer = createTestPackerForBasic();
			await packer.pack();
			const generatedPkg = require(join(BASIC_CWD, 'temp', 'package.json'));
			expect(generatedPkg).toBeTruthy();
			expect(generatedPkg).toMatchSnapshot();
			expect(generatedPkg.name).toEqual('@fixture/main-packed');
			expect(generatedPkg.dependencies).toStrictEqual({
				'ansi-styles': '4.0.0', // from subsub
				debug: '*', // from main
				smallest: '1.0.1', // from sub
				'supports-color': '7.0.0' // from subsubsub
			});
		});

		it('should copy the source files correctly', async () => {
			const packer = createTestPackerForBasic();
			await packer.pack();
			const contents = require(join(BASIC_CWD, 'temp', 'src', 'test.js'));
			expect(contents).toEqual('Hello world');
		});

		it('should copy sub-modules correctly', async () => {
			const fakeHook = jest.fn(async () => Promise.resolve());
			const packer = createTestPackerForBasic({
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
			const packer = createTestPackerForBasic();
			await packer.pack();

			const debugExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', 'debug'));
			expect(debugExists).toBe(true);

			const msExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', 'ms'));
			expect(msExists).toBe(true);

			const smallestExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', 'smallest'));
			expect(smallestExists).toBe(true);

			const arrayExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', 'to-array'));
			expect(arrayExists).toBe(true);
		});

		it('should install all internal modules', async () => {
			const packer = createTestPackerForBasic();
			await packer.pack();

			const baseFolderExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', '@fixture'));
			expect(baseFolderExists).toBe(true);

			const subModuleExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', '@fixture', 'sub'));
			expect(subModuleExists).toBe(true);

			expect(require(resolve(BASIC_CWD, 'temp', 'node_modules', '@fixture', 'sub', 'src', 'index.js'))).toEqual(
				'Hello from sub'
			);
		});

		it('should generate correct metadata for the packed bundle', async () => {
			const packer = createTestPackerForBasic();
			await packer.pack();
			const generatedPkg = require(join(BASIC_CWD, 'temp', 'package.json'));
			expect(generatedPkg).toBeDefined();
			expect(generatedPkg.monopacker).toBeDefined();
			expect(generatedPkg.monopacker).toMatchSnapshot();
		});

		it('should generate a hash for the packed bundle', async () => {
			const packer = createTestPackerForBasic();
			await packer.pack();
			const generatedPkg = require(join(BASIC_CWD, 'temp', 'package.json'));
			expect(generatedPkg).toBeDefined();
			expect(generatedPkg.monopacker).toBeDefined();
			expect(generatedPkg.monopacker.hash).toBeDefined();
			expect(generatedPkg.monopacker.hash.length).toBeGreaterThan(0);
			expect(generatedPkg.monopacker.hash).toMatchSnapshot();
		});

		describe('cyclical dependencies', () => {
			it('should detect endless cycles in dependencies', async () => {
				const packer = createTestPackerForcyclical();
				const willFailDueCyclical = async () => {
					try {
						await packer.validate();
					} catch (err) {
						throw new Error(err);
					}
				};

				await expect(willFailDueCyclical()).rejects.toThrow(
					'Error: @fixture/cyclical-a relies on @fixture/cyclical-b and vice versa, please fix this cyclical dependency'
				);
			});

			it('should abort packing if detecting cyclical dependencies', async () => {
				const fakePackedHook = jest.fn(() => Promise.resolve());
				const packer = createTestPackerForcyclical({
					[HookPhase.PACKED]: [fakePackedHook]
				});
				const willFailDueCyclical = async () => {
					try {
						await packer.pack();
					} catch (err) {
						throw new Error(err);
					}
				};

				await expect(willFailDueCyclical()).rejects.toThrow(
					'Error: @fixture/cyclical-a relies on @fixture/cyclical-b and vice versa, please fix this cyclical dependency'
				);
				expect(fakePackedHook).toHaveBeenCalledTimes(0);
			});
		});

		describe('multitree dependencies', () => {
			it('should analyze multitree dependencies correctly', async () => {
				const packer = createTestPackerForMultitree();
				const analytics = await packer.analyze(false);
				expect(analyticsToSnapshot(analytics)).toMatchSnapshot();
				expect(analytics.graph).toStrictEqual({
					"@fixture/multitree-a": {
						smallest: "1.0.1",
					},
					"@fixture/multitree-ab": {},
					"@fixture/multitree-b": {
						ms: "2.1.2",
					},
					"@fixture/multitree-c": {
						external: {
							ms: "2.1.2",
							smallest: "1.0.1",
						},
						internal: {
							"@fixture/multitree-a": "1.0.0",
							"@fixture/multitree-ab": "1.0.0",
							"@fixture/multitree-b": "1.0.0",
						},
					},
				})
			});

			it('should pack multitree apps correctly', async () => {
				const packer = createTestPackerForMultitree();
				const analytics = await packer.analyze();
				await packer.pack();
				const generatedPkg = require(join(MULTITREE_CWD, 'temp', 'package.json'));

				expect(generatedPkg).toStrictEqual({
					name: "@fixture/multitree-c-packed",
					version: "1.0.0",
					description: "",
					monopacker: {
						hash: (analytics as IAnalyticsWithIntegrity).integrity,
						version: "1",
						linked: {
							"@fixture/multitree-ab": "1.0.0",
							"@fixture/multitree-a": "1.0.0",
							"@fixture/multitree-b": "1.0.0"
						}
					},
					dependencies: {
						smallest: "1.0.1",
						ms: "2.1.2"
					}
				});
			});
		});

		describe('multiple identical package names', () => {
			it('should abort if multiple packages have the same name', async () => {
				const packer = createTestPackerForDuplicates();
				const willFailDueDuplicates = async () => {
					try {
						await packer.validate();
					} catch (err) {
						throw new Error(err);
					}
				};

				await expect(willFailDueDuplicates()).rejects.toThrow(
					'Duplicate package names found: @fixture/duplicate-a'
				);
			})
		})
	});
});
