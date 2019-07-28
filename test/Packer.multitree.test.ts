import { resolve, join } from 'path';
import { Packer } from '../src/Packer';
import { IAnalyticsWithIntegrity } from '../src/types';
import { createTestPackerFor, analyticsToSnapshot, createResolverWithin } from './utils';

const MULTITREE_CWD = resolve(__dirname, 'fixtures/multitree');

const createTestPackerForMultitree = (hooks?: Packer['hooks']) =>
	createTestPackerFor(MULTITREE_CWD, 'packages/c', hooks);

const resolveInTarget = createResolverWithin(resolve(MULTITREE_CWD, 'temp'));

describe('Packer', () => {
	describe('Lerna', () => {
		describe('multitree dependencies', () => {
			it('should analyze multitree dependencies correctly', async () => {
				const packer = createTestPackerForMultitree();
				const analytics = await packer.analyze(false);
				expect(analyticsToSnapshot(analytics)).toMatchSnapshot();
				expect(analytics.graph).toStrictEqual({
					'@fixture/multitree-a': {
						smallest: '1.0.1'
					},
					'@fixture/multitree-ab': {},
					'@fixture/multitree-b': {
						ms: '2.1.2'
					},
					'@fixture/multitree-c': {
						external: {
							ms: '2.1.2',
							smallest: '1.0.1'
						},
						internal: {
							'@fixture/multitree-a': '1.0.0',
							'@fixture/multitree-ab': '1.0.0',
							'@fixture/multitree-b': '1.0.0'
						}
					}
				});
			});

			it('should pack multitree apps correctly', async () => {
				const packer = createTestPackerForMultitree();
				const analytics = await packer.analyze();
				await packer.pack();
				const generatedPkg = require(resolveInTarget('package.json'));
				expect(generatedPkg).toMatchSnapshot();
				expect(generatedPkg).toStrictEqual({
					name: '@fixture/multitree-c-packed',
					version: '1.0.0',
					description: '',
					scripts: {
						postinstall:
							'npm i --ignore-scripts ./.monopacker/fixture-multitree-ab-1.0.0.tgz ./.monopacker/fixture-multitree-a-1.0.0.tgz ./.monopacker/fixture-multitree-b-1.0.0.tgz'
					},
					monopacker: {
						hash: (analytics as IAnalyticsWithIntegrity).integrity,
						version: '1',
						linked: {
							'@fixture/multitree-ab': '1.0.0',
							'@fixture/multitree-a': '1.0.0',
							'@fixture/multitree-b': '1.0.0'
						}
					},
					dependencies: {
						smallest: '1.0.1',
						ms: '2.1.2'
					}
				});
			});
		});
	});
});
