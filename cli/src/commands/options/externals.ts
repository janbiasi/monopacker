import { Option } from 'commander';
import { commaSeparatedListProcessing } from '../processing/comma-separated-list';

export interface ExternalsOption {
	externals: string[];
}

export const ENV = 'MONOPACKER_EXTERNALS' as const;

export const externalsOption = new Option(
	'-e, --externals <packages>',
	'Only respected when passing a source: which dependencies to treat as "external"'
)
	// .default([], 'Default: no externals')
	.env(ENV)
	.argParser(commaSeparatedListProcessing);
