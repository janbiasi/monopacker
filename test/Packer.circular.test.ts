import { resolve } from 'path';
import { Packer } from '../src/Packer';
import { HookPhase } from '../src/types';
import { createTestPackerFor } from './utils';

const CIRCULAR_FIXTURE = resolve(__dirname, 'fixtures/circular');

const createTestPackerForCircular = (hooks?: Packer['hooks']) =>
	createTestPackerFor(CIRCULAR_FIXTURE, 'packages/a', hooks);

describe('Packer', () => {
	describe('Lerna', () => {
		describe('circular dependencies', () => {
			it('should detect endless cycles in dependencies', async () => {
				const packer = createTestPackerForCircular();
				const willFailDueCircular = async () => {
					try {
						await packer.validate();
					} catch (err) {
						throw new Error(err);
					}
				};

				await expect(willFailDueCircular()).rejects.toThrow(
					'Error: @fixture/circular-a relies on @fixture/circular-b and vice versa, please fix this circular dependency'
				);
			});

			it('should abort packing if detecting circular dependencies', async () => {
				const fakePackedHook = jest.fn(() => Promise.resolve());
				const packer = createTestPackerForCircular({
					[HookPhase.PACKED]: [fakePackedHook]
				});
				const willFailDueCircular = async () => {
					try {
						await packer.pack();
					} catch (err) {
						throw new Error(err);
					}
				};

				await expect(willFailDueCircular()).rejects.toThrow(
					'Error: @fixture/circular-a relies on @fixture/circular-b and vice versa, please fix this circular dependency'
				);
				expect(fakePackedHook).toHaveBeenCalledTimes(0);
			});
		});
	});
});
