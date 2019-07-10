export interface DependenciesLike {
	[name: string]: string;
}

export interface Package {
	name: string;
	version: string;
	description?: string;
	dependencies?: DependenciesLike;
	devDependencies?: DependenciesLike;
	peerDependencies?: DependenciesLike;
}
