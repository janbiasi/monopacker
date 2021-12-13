/**
 * General record-like type to visualize the shape of dependencies,
 * but the type is equivalent to `Record<string, string>`
 */
export interface PackageDependencyMap {
	/**
	 * Map of package names to versions.
	 */
	[packageName: string]: string;
}

/**
 * Type of `package.json` > `peerDependenciesMeta`
 */
export interface PackagePeerDependenciesMeta {
	[packageName: string]: {
		optional?: boolean;
	};
}

/**
 * Type equivalent to a `package.json` file
 */
export interface PackageJson {
	name: string;
	version: string;
	description?: string;
	keywords?: string[];
	homepage?: string;
	os?: string[];
	engines?: {
		node?: string;
		npm?: string;
	};
	scripts?: Record<string, string>;
	dependencies?: PackageDependencyMap;
	devDependencies?: PackageDependencyMap;
	peerDependencies?: PackageDependencyMap;
	optionalDependencies?: PackageDependencyMap;
	peerDependenciesMeta?: PackagePeerDependenciesMeta;
	bundledDependencies?: string[];
}
