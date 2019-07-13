import { dirname, relative, join, resolve } from 'path';
import { createHash as createNativeHash } from 'crypto';
import * as execa from 'execa';
import * as _rimraf from 'rimraf';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as matcher from 'matcher';
import { ncp } from 'ncp';
import { DependenciesLike, LernaPackageList, IAnalytics } from './types';

export function rimraf(pathName: string, options: _rimraf.Options = {}): Promise<void> {
	return new Promise((resolve, reject) => {
		_rimraf(pathName, options, err => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
}

export function copyDir(
	source: string,
	destination: string,
	opts: { dereference?: boolean; filter?: (filename: string) => boolean } = {
		dereference: true
	}
): Promise<void> {
	return new Promise((resolve, reject) => {
		ncp(source, destination, opts, err => {
			if (err) {
				return reject(err);
			}
			resolve();
		});
	});
}

export async function getLernaPackages2(cwd: string): Promise<LernaPackageList> {
	const { stdout } = await execa('lerna', ['ls', '--all', '--json'], {
		cwd
	});

	return JSON.parse(stdout);
}

export async function asyncForEach<T extends any = any>(
	array: T[],
	callback: (entry: T, index: number) => Promise<any>
) {
	if (!Array.isArray(array)) {
		return Promise.resolve();
	}

	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index);
	}
}

export function extractDependencies(
	dependencyLike: Record<string, string> = {},
	filter: (dep: string) => boolean = () => true
) {
	return Object.keys(dependencyLike)
		.filter(filter)
		.reduce(
			(prev, curr) => ({
				...prev,
				[curr]: dependencyLike[curr]
			}),
			{} as DependenciesLike
		);
}

export async function readJSON<T extends object = {}>(f: string): Promise<T> {
	try {
		const contents = await fs.readFile(f);
		return JSON.parse(contents.toString());
	} catch (err) {
		return {} as T;
	}
}

function loadJson(f: string) {
	try {
		return JSON.parse(fs.readFileSync(f, 'utf8') || '');
	} catch (err) {
		return null;
	}
}

export function getLernaPackages(root: string) {
	const patterns: string[] =
		(() => {
			try {
				return loadJson(`${root}/lerna.json`).packages;
			} catch (err) {}
			try {
				return loadJson(`${root}/package.json`).workspaces;
			} catch (err) {}
			return [];
		})() || [];

	const modules: string[] = patterns.reduce((acc, patt) => {
		const found = glob.sync(patt, { cwd: root }).filter(f => !f.match(/node_modules/));
		return acc.concat(found);
	}, []);

	const subModules: LernaPackageList = modules.reduce(
		(acc, f): LernaPackageList => {
			try {
				let fname = `${root}/${f}`;
				const stat = fs.statSync(fname);
				fname = stat.isDirectory() ? fname : dirname(fname);
				const pkgJson = join(fname, `package.json`);
				// const pkgStat = fs.statSync(pkgJson);
				const pkg = loadJson(pkgJson);
				const ref = resolve(relative(root, fname).replace(/[\\]+/g, '/'));
				const isDuplicate = acc.filter(m => m.location === ref);

				if (!isDuplicate.length && pkg && pkg !== null) {
					if (!pkg.name || !pkg.version) {
						console.log(`Invalid package ${pkg.name || '<unknown>'} in ${ref}: name or version missing`);
					}
					acc.push({
						name: pkg.name,
						version: pkg.version || '*',
						description: pkg.description || '',
						private: !!pkg.private,
						location: ref
					});
				}
			} catch (err) {
				/* istanbul ignore next */
				console.log(err);
			}
			return acc;
		},
		[] as LernaPackageList
	);

	return subModules;
}

export function countMsg(countable: Record<string, string> | any[], singular: string, plural?: string) {
	plural = plural || `${singular}s`;
	let size = -1;

	if (Array.isArray(countable)) {
		size = countable.length;
	} else {
		size = Object.keys(countable).length;
	}

	return size === 1 ? `1 ${singular}` : `${size} ${plural}`;
}

export function displayPath(base: string, toDisplay: string) {
	return resolve(toDisplay).replace(resolve(base), '~');
}

export function createHash(value: string) {
	return createNativeHash('sha256')
		.update(value)
		.digest('hex');
}

export function createIntegrityHash(version: string, analytics: IAnalytics) {
	return createHash(
		version +
			JSON.stringify({
				...analytics,
				dependencies: {
					...analytics.dependencies,
					internal: analytics.dependencies.internal.map(
						entry => `${entry.name}@${entry.version}|${!!entry.private}`
					)
				}
			})
	);
}

export const pkg = require('../package.json');

export { fs, matcher, execa };
