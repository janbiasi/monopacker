import type { PackageJson } from './types/package';

export const parsePackage = (absolutePath: string): { pkg: PackageJson, location: string } => {
	try {
		return {
			pkg: require(absolutePath),
			location: absolutePath,
		}
	} catch (err) {
		throw new Error(`Unable to load package.json at ${absolutePath}: ${err}`);
	}
};

export const parsePackages = (paths: string[]) => {
	return paths.map(parsePackage);
};
