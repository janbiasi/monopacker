import { resolve } from 'path';
import { Packer } from '../src/Packer';
import { fs } from '../src/utils';
import { analyticsToSnapshot, createTestPackerFor, createResolverWithin } from './utils';

const BASIC_CWD = resolve(__dirname, 'fixtures/basic');

const createTestPackerForBasic = (hooks?: Packer['hooks']) => createTestPackerFor(BASIC_CWD, 'packages/main', hooks);

const resolveInTarget = createResolverWithin(resolve(BASIC_CWD, 'temp'));

describe('Packer', () => {
	describe('Lerna', () => {
		describe('analytics', () => {
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
					const contents = fs.readFileSync(
						resolveInTarget('.monopacker', 'monopacker.analytics.json'),
						'utf8'
					);
					expect(contents).toBeDefined();
				};
				expect(validateAnalyticsOutput).not.toThrow();
				validateAnalyticsOutput();
				try {
					const contents = fs.readFileSync(
						resolveInTarget('.monopacker', 'monopacker.analytics.json'),
						'utf8'
					);
					expect(contents).toBeDefined();
					const deserialized = JSON.parse(contents);
					expect(deserialized).toBeTruthy();
					expect(analyticsToSnapshot(deserialized)).toMatchSnapshot();
					expect(deserialized.dependencies.external).toBeDefined();
					expect(deserialized.dependencies.internal).toBeDefined();
					expect(deserialized.dependencies.peer).toBeDefined();
					expect(deserialized.dependencies.internal.length).toEqual(1);
					expect(deserialized.dependencies.peer.smallest).toBeDefined();
				} catch (err) {}
			});
		});
	});
});
