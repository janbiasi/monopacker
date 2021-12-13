/**
 * Configuration for single application packs
 */
export interface PackConfig {
	/**
	 * Define files which should get copied during the packing process, defaults to `['**', '!package.json']`
	 */
	copy?: string[];
	/**
	 * Output path of the packed application, defaults to `packed/<packageName>`.
	 * Available placeholders to use:
	 * - `<packageName>` - The name of the package
	 */
	destination?: string;
	/**
	 * Expressions to match package names which are internally defined (optional)
	 * Can be used for eg. rewriting globally available modules such as 'react-scripts'
	 * to provide a custom implementation for.
	 */
	internals?: string[];
	/**
	 * The package name or directory path to the application which should be packed.
	 * If the package name is omitted, monopacker will scan through the resolved
	 * package graph to find the matching source directory.
	 */
	source: string;
}

export interface ResolverConfig {
	/**
	 * An array of glob patterns to exclude matches. This is an alternative way to use negative patterns.
	 * By default, the resolver will scan the root directory for packages.
	 * The preset resolver lookup config includes the following:
	 * - All `package.json` files in the `rootDir`
	 * - Excludes: `node_module`, `build`, `dist`, `lib` and other common non-relevant folders
	 * @see https://github.com/mrmlnc/fast-glob#ignore
	 */
	ignore?: string[];

	/**
	 * Specifies the maximum depth of a read directory relative to the start directory.
	 * Default is set to `7`
	 * @see https://github.com/mrmlnc/fast-glob#deep
	 */
	deep?: number;
	/**
	 * Indicates whether to traverse descendants of symbolic link directories when expanding ** patterns.
	 * Default is set to `true`
	 * @see https://github.com/mrmlnc/fast-glob#followsymboliclinks
	 */
	followSymbolicLinks?: boolean;
	/**
	 * Defines if the resolver patch peers if the target package contains values in the `peerDependencies` field.
	 * Default is set to `true`
	 */
	includePeers?: boolean;
}

/**
 * Main configuration type declaration for the monopacker tool.
 */
export interface Config {
	/**
	 * Enables or disables the usage of internal caches, defaults to `true`
	 * @experimental
	 */
	cache?: boolean;
	/**
	 * Expressions to match package names which are internally defined (optional)
	 * Can be used for eg. rewriting globally available modules such as 'react-scripts'
	 * to provide a custom implementation for.
	 * @experimental
	 */
	internals?: string[];
	/**
	 * Settings for the main package resolver.
	 */
	resolver?: ResolverConfig;
	/**
	 * Root directory for packings, defaults to `process.cwd()`
	 */
	rootDir?: string;
	/**
	 * A list of pack definitions, where each pack represents an application which
	 * should get packed.
	 * @see {@link PackConfig}
	 */
	packs: PackConfig[];
}
