import { Option } from 'commander';

export interface SilentOption {
	silent: boolean;
}

export const ENV = 'MONOPACKER_SILENT' as const;

export const silentOption = new Option('-s, --silent', 'Silence all output').env(ENV);
// .default(false, 'Default: allow output');
