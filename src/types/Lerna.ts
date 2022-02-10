export interface ILernaConfig {
	command?: {
		[command: string]: object;
	};
	version?: string;
	packages: string[];
}
