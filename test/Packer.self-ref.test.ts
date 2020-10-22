import { resolve } from 'path';
import { Packer } from '../src/Packer';
import { createTestPackerFor } from './utils';

const SELF_CWD = resolve(__dirname, 'fixtures/self');

const createTestPackerForSelf = (hooks?: Packer['hooks']) => createTestPackerFor(SELF_CWD, 'packages/main', hooks);

describe('Packer', () => {
	describe('Lerna', () => {
		describe('self-referencing packages', () => {
			it('should splice itself from the ref list', async () => {
				const packer = createTestPackerForSelf();
				const willFailDueCircular = async () => {
					try {
						await packer.validate();
					} catch (err) {
						throw new Error(err);
					}
				};
				await expect(willFailDueCircular()).rejects.toThrow(
					'Error: @fixture/self-main relies on @fixture/self-main and vice versa, please fix this circular dependency'
				);
			});
		});
	});
});
