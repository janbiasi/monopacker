import globby from 'globby';
import { Config, defaultIgnorePatterns } from '@monopacker/config';

/**
 * Find all packages in the given directory.
 * @param {string} rootDir - The directory to search.
 * @param {SearchOptions} options - Options for finding packages.
 * @returns
 */
export const searchPackages = async (rootDir: string, config: Config['resolver']) => {
	const packages = await globby(['**/package.json'], {
		cwd: rootDir,
		ignore: config?.ignore || defaultIgnorePatterns,
		followSymbolicLinks: config?.followSymbolicLinks === false ? false : true,
		deep: config?.deep || 7
	});

	if (packages.length === 0) {
		throw new Error(`Unable to find any packages in ${rootDir}`);
	}

	return packages;
};

/**
 * Basic search via globs
 * @param rootDir
 * @param globs
 * @returns
 */
export async function searchFiles(rootDir: string, globs: string[]) {
	try {
		return await globby(globs, {
			cwd: rootDir,
			deep: 20
		});
	} catch (err) {
		throw new Error(`Failed to copy files "${globs.join(',')}" in ${rootDir}:\n\n${err}`);
	}
}
