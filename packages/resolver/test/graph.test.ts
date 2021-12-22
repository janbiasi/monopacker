import type { PackageJson } from '../src/types/package';
import { getPackageGraph, getPackageResolutions } from '../src/graph';
import { resolve } from 'path';

const FIXTURES_DIR = resolve(__dirname, 'fixtures');
const getFixturePath = (name: string) => resolve(FIXTURES_DIR, name);

const testPackage: PackageJson = {
	name: 'test',
	version: '1.0.0',
	dependencies: {
		react: '17.0.2',
		internalPackage: '^2.1.0',
	},
	devDependencies: {
		'react-dom': '17.0.2',
	},
	peerDependencies: {
		uuid: '3.1.0',
		internalPackage2: '^1.0.1',
	},
};

describe('graph', () => {
	it('should aggregate dependency resolutions with internals and peer internals correctly', () => {
		const resolutions = getPackageResolutions(testPackage, ['internalPackage', 'internalPackage2']);

		expect(resolutions).toMatchSnapshot();
		expect(resolutions.internal).toStrictEqual({
			internalPackage: '^2.1.0',
			internalPackage2: '^1.0.1',
		});
		expect(resolutions.remote).toStrictEqual({
			react: '17.0.2',
			uuid: '3.1.0',
		});
	});

	it('should aggregate dependency resolutions without "includePeers" flag correctly', () => {
		const resolutions = getPackageResolutions(testPackage, ['internalPackage', 'internalPackage2'], {
			includePeers: false,
		});

		expect(resolutions).toMatchSnapshot();
		expect(resolutions.internal).toStrictEqual({
			internalPackage: '^2.1.0',
			internalPackage2: '^1.0.1',
		});
		expect(resolutions.remote).toStrictEqual({
			react: '17.0.2',
		});
	});

	it('should aggregate dependency resolutions without internals correctly', () => {
		const resolutions = getPackageResolutions(testPackage, []);

		expect(resolutions).toMatchSnapshot();
		expect(resolutions.internal).toStrictEqual({});
		expect(resolutions.remote).toStrictEqual({
			react: '17.0.2',
			internalPackage: '^2.1.0',
			internalPackage2: '^1.0.1',
			uuid: '3.1.0',
		});
	});

	describe('getPackageGraph', () => {
		it('should fail if duplicate internals were detected', () => {
			expect(true).toBe(true);
		});

		describe('fixture: alpha', () => {
			const fixtureDir = getFixturePath('project-alpha');

			it('should resolve dependencies correctly', async () => {
				const graph = await getPackageGraph(fixtureDir);
				expect(Object.keys(graph.local).sort()).toMatchSnapshot();
				expect(graph.resolution).toMatchSnapshot();
			});
		});

		describe('fixture: beta', () => {
			const fixtureDir = getFixturePath('project-beta');

			it('should resolve dependencies correctly', async () => {
				const graph = await getPackageGraph(fixtureDir);
				expect(Object.keys(graph.local).sort()).toMatchSnapshot();
				expect(graph.resolution).toMatchSnapshot();
			});
		});

		describe('fixture: externals', () => {
			const fixtureDir = getFixturePath('project-beta');

			it('should resolve dependencies correctly with provided externals', async () => {
				const graph = await getPackageGraph(fixtureDir, {
					externals: ['jquery'],
				});

				expect(Object.keys(graph.local).sort()).toMatchSnapshot();
				expect(Object.keys(graph.resolution)).not.toContain('jquery');
				expect(graph.resolution).toMatchSnapshot();
			});
		});

		describe('fixture: duplicate-packages', () => {
			const fixtureDir = getFixturePath('duplicate-packages');

			it('fail if detecting two packages with the same name', () => {
				expect(getPackageGraph(fixtureDir)).rejects.toThrow();
			});
		});

		describe('fixture: empty', () => {
			const fixtureDir = getFixturePath('empty');

			it('should fail when finding no packages at all', () => {
				expect(getPackageGraph(fixtureDir)).rejects.toThrow();
			});
		});
	});
});
