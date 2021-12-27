import { Option } from 'commander';

export interface TraceOption {
	trace: boolean;
}

export const ENV = 'MONOPACKER_TRACE' as const;

export const traceOption = new Option('-t, --trace', 'Display extra information when run command').env(ENV);
// .default(
// 	false,
// 	'Default: no trace'
// );
