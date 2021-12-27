import { Option } from 'commander';

export interface JsonOption {
	json: boolean;
}

export const ENV = 'MONOPACKER_JSON' as const;

export const jsonOption = new Option('-j, --json', 'Output results as JSON')
	.default(false, 'Defaults to false (rich output)')
	.env(ENV);
