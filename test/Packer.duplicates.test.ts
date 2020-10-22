import { resolve } from 'path';
import { Packer } from '../src/Packer';
import { createTestPackerFor } from './utils';

const DUPLICATES_CWD = resolve(__dirname, 'fixtures/duplicates');

const createTestPackerForDuplicates = (hooks?: Packer['hooks']) =>
	createTestPackerFor(DUPLICATES_CWD, 'packages/main', hooks);

describe('Packer', () => {
	describe('Lerna', () => {
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
			});
		});
	});
});
