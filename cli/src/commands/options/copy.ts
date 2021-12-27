import { Option } from 'commander';
import { commaSeparatedListProcessing } from '../processing/comma-separated-list';

export interface CopyOption {
	copy: string[];
}

export const ENV = 'MONOPACKER_COPY' as const;

export const copyOption = new Option('-c, --copy <paths>', 'Only respected when passing a source: which files to copy')
	// .default([], 'Default: use internal defaults')
	.env(ENV)
	.argParser(commaSeparatedListProcessing);
