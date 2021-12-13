export enum Namespace {
	CONFIG = 'config',
	CLI = 'cli',
	PLUGIN = 'plugin',
	LOG = 'log',
	RESOLVER = 'resolver',
	RUNTIME = 'runtime'
}

export const namespaces: readonly string[] = Object.keys(Namespace).filter(key => typeof key === 'string');

export const visualNamespaceWidth = namespaces.reduce((max, name) => Math.max(max, name.length), 0);
