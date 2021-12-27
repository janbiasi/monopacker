import { Option } from 'commander';

export interface VisualOption {
	visual: boolean;
}

export const ENV = 'MONOPACKER_VISUAL' as const;

export const visualOption = new Option('-vs, --visual', 'Output results as a visual representation')
	.default(false, 'Defaults to false (console output)')
	.env(ENV);
