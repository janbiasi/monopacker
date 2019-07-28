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

export interface ArtificalPackage {
	name: string;
	version: string;
	description: string;
	scripts?: {
		[executable: string]: string;
	};
	monopacker: {
		hash: string;
		version: string;
		linked: {
			[name: string]: string;
		};
	};
	dependencies: {
		[name: string]: string;
	};
}
