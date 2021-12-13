import { resolve } from 'path';
import { searchPackages } from '../src/search';

const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const getFixturePath = (name: string) => resolve(FIXTURES_DIR, name);

describe('search', () => {
	describe('fixture: empty', () => {
		const fixtureDir = getFixturePath('empty');

		it('should fail if there are no packages (TODO: should it?)', () => {
			expect(() => searchPackages(fixtureDir, {})).rejects.toThrowError();
		});
	});

	/**
	 * - 1 App package (includes A & B)
	 * - 2 Library packages (independent)
	 */
	describe('fixture: project alpha', () => {
		const fixtureDir = getFixturePath('project-alpha');

		it('should resolve package paths correctly', async () => {
			const results = await searchPackages(fixtureDir, {});

			expect(results).toHaveLength(3);
			expect(results).toContain('app/package.json');
			expect(results).toContain('packages/a/package.json');
			expect(results).toContain('packages/b/package.json');
		});
	});
	/**
	 * - 1 App package (includes A)
	 * - 2 Library packages (A includes B, B is independent)
	 */
	describe('fixture: project beta', () => {
		const fixtureDir = getFixturePath('project-alpha');

		it('should resolve package paths correctly', async () => {
			const results = await searchPackages(fixtureDir, {});

			expect(results).toHaveLength(3);
			expect(results).toContain('app/package.json');
			expect(results).toContain('packages/a/package.json');
			expect(results).toContain('packages/b/package.json');
		});
	});
});
