import { resolve } from 'path';
import { Packer } from '../src/Packer';
import { createTestPackerFor } from './utils';

const INVALID_CWD = resolve(__dirname, 'fixtures/duplicates');

const createTestPackerToGalaxy = (hooks?: Packer['hooks']) =>
	createTestPackerFor(INVALID_CWD, 'packages/does-not-exist', hooks);

describe('Packer', () => {
	describe('Lerna', () => {
		describe('invalid env', () => {
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
		});
	});
});
