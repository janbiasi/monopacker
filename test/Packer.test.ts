import { resolve, join } from 'path';
import { Packer } from '../src/Packer';
import { fs } from '../src/utils';
import { HookPhase } from '../src/types';
import { createTestPackerFor, createResolverWithin } from './utils';
import { readFile, existsSync } from 'fs-extra';

const BASIC_CWD = resolve(__dirname, 'fixtures/basic');

const createTestPackerForBasic = (hooks?: Packer['hooks']) => createTestPackerFor(BASIC_CWD, 'packages/main', hooks);

const resolveInTarget = createResolverWithin(join(BASIC_CWD, 'temp'));

describe('Packer', () => {
	describe('Lerna', () => {
		describe('core functions', () => {
			it('should generate an artificial package correctly', async () => {
				const packer = createTestPackerForBasic();
				await packer.pack();
				const generatedPkg = require(resolveInTarget('package.json'));
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
				const contents = require(resolveInTarget('src', 'test.js'));
				expect(contents).toEqual('Hello world');
			});

			it('should copy sub-modules correctly', async () => {
				const fakeHook = jest.fn(async () => Promise.resolve());
				const packer = createTestPackerForBasic({
					[HookPhase.INIT]: [fakeHook],
					[HookPhase.PRECOPY]: [fakeHook],
					[HookPhase.POSTCOPY]: [fakeHook],
					[HookPhase.PREANALYZE]: [fakeHook],
					[HookPhase.POSTANALYZE]: [fakeHook],
					[HookPhase.PRELINK]: [fakeHook],
					[HookPhase.POSTLINK]: [fakeHook],
					[HookPhase.PACKED]: [fakeHook]
				});
				// TODO: call time was 10 before, we removed install as default
				await packer.pack();
				expect(fakeHook).toBeCalledTimes(7);
			});

			it.skip('should install all external modules', async () => {
				const packer = createTestPackerForBasic();
				await packer.pack();

				const debugExists = await fs.pathExists(resolveInTarget('node_modules', 'debug'));
				expect(debugExists).toBe(true);

				const msExists = await fs.pathExists(resolveInTarget('node_modules', 'ms'));
				expect(msExists).toBe(true);

				const smallestExists = await fs.pathExists(resolveInTarget('node_modules', 'smallest'));
				expect(smallestExists).toBe(true);

				const arrayExists = await fs.pathExists(resolveInTarget('node_modules', 'to-array'));
				expect(arrayExists).toBe(true);
			});

			it('should generate a valid registry file', async () => {
				const packer = createTestPackerForBasic();
				await packer.pack();

				let contents = await readFile(resolveInTarget('.monopacker', 'monopacker.registry.json'));
				const stringContents = contents.toString();
				expect(stringContents).toMatchSnapshot();

				const list = JSON.parse(stringContents);
				expect(list.length).toEqual(3);
				expect(list).toStrictEqual([
					'./.monopacker/fixture-sub-0.1.3.tgz',
					'./.monopacker/fixture-subsub-0.1.3.tgz',
					'./.monopacker/fixture-subsubsub-0.1.3.tgz'
				]);
			});

			it('should pack all internal modules to tarballs', async () => {
				const packer = createTestPackerForBasic();
				await packer.pack();

				const fixtureSubExists = existsSync(resolveInTarget('.monopacker', 'fixture-sub-0.1.3.tgz'));
				const fixtureSubSubExists = existsSync(resolveInTarget('.monopacker', 'fixture-subsub-0.1.3.tgz'));
				const fixtureSubSubSubExists = existsSync(
					resolveInTarget('.monopacker', 'fixture-subsubsub-0.1.3.tgz')
				);

				expect(fixtureSubExists).toBe(true);
				expect(fixtureSubSubExists).toBe(true);
				expect(fixtureSubSubSubExists).toBe(true);
			});

			it('should generate correct metadata for the packed bundle', async () => {
				const packer = createTestPackerForBasic();
				await packer.pack();
				const generatedPkg = require(resolveInTarget('package.json'));
				expect(generatedPkg).toBeDefined();
				expect(generatedPkg.monopacker).toBeDefined();
				expect(generatedPkg.monopacker).toMatchSnapshot();
			});

			it('should generate a hash for the packed bundle', async () => {
				const packer = createTestPackerForBasic();
				await packer.pack();
				const generatedPkg = require(resolveInTarget('package.json'));
				expect(generatedPkg).toBeDefined();
				expect(generatedPkg.monopacker).toBeDefined();
				expect(generatedPkg.monopacker.hash).toBeDefined();
				expect(generatedPkg.monopacker.hash.length).toBeGreaterThan(0);
				expect(generatedPkg.monopacker.hash).toMatchSnapshot();
			});
		});
	});
});
