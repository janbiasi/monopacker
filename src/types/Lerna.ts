export interface LernaConfig {
	command?: {
		[command: string]: object;
	};
	version?: string;
	packages: string[];
}

export interface LernaPackageListEntry {
	name: string;
	description?: string;
	version: string;
	private: boolean;
	location: string;
}

export type LernaPackageList = LernaPackageListEntry[];
