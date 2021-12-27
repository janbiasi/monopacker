import type { Config, PackConfig, ResolverConfig } from './types';

export const requiredFilesToCopy = ['!package.json', '!node_modules'];

/**
 * Files which should get copied
 */
export const defaultFilesToCopy = [
	'**',
	...requiredFilesToCopy,
	'!.editorconfig',
	'!.gitignore',
	'!.nvmrc',
	'!.node-version',
	'!.npmrc',
	'!**.md',
	'!tsconfig*.json',
];

/**
 * Patterns which should be ignored in every glob
 */
export const defaultIgnorePatterns = [
	'**/node_modules',
	'**/bower_components',
	'**/vendor',
	'**/dist',
	'**/build',
	'**/lib',
	'**/bin',
	'**/test',
	'**/tests',
	'**/__tests__',
	'**/__mocks__',
	'**/__snapshots__',
	'**/__test__',
];

/**
 * Patch default config for a pack configuration
 * @param {PackConfig} config
 * @returns
 */
function patchPackDefaults(config: PackConfig): Required<PackConfig> {
	return {
		source: config.source,
		copy: config.copy ? [...config.copy, ...requiredFilesToCopy] : defaultFilesToCopy,
	};
}

function patchResolverDefaults(config: ResolverConfig): Required<ResolverConfig> {
	return {
		ignore: config.ignore || defaultIgnorePatterns,
		deep: config.deep || 7,
		followSymbolicLinks: config.followSymbolicLinks || true,
		includePeers: config.includePeers || true,
		externals: config.externals || [],
	};
}

export function patchConfigDefaults(config: Config): Required<Config> {
	return {
		rootDir: config.rootDir || './',
		cache: config.cache === false ? false : true,
		internals: config.internals || [],
		packageManager: config.packageManager || 'npm',
		packs: config.packs.map(patchPackDefaults),
		resolver: patchResolverDefaults(config.resolver || {}),
	};
}
