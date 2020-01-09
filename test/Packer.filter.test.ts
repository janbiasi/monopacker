import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Packer } from '../src/Packer';
import { TestPacker } from './const';

jest.setTimeout(10 * 1000); // 10s

const CWD = resolve(__dirname, 'fixtures/filter');

const createPacker = (copySettings: string[]) =>
	new Packer({
		cwd: CWD,
		source: 'packages/main',
		target: resolve(CWD, 'temp'),
		hooks: {},
		copy: copySettings
	});

describe('Packer', () => {
	describe('filter', () => {
		it('default settings', () => {
			const packer = createPacker([]);
			expect(((packer as any) as TestPacker).options.copy).toEqual(['**', '!node_modules', '!package.json']);
		});

		it('override settings and packing', async () => {
			const packer = createPacker(['!**/.next', '!**/coverage', '!**/*.test.*', '!**/exclude.js']);
			expect(((packer as any) as TestPacker).options.copy).toEqual([
				'**',
				'!node_modules',
				'!package.json',
				'!**/.next',
				'!**/coverage',
				'!**/*.test.*',
				'!**/exclude.js'
			]);

			await packer.pack();

			// files which should't get copied
			expect(() => {
				readFileSync(resolve(CWD, 'temp', 'src', 'coverage', 'coverage.json'));
			}).toThrow();
		});
	});
});
