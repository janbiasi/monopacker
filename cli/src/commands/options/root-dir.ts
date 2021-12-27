import { Option } from 'commander';

export interface RootDirOption {
	rootDir?: string;
}

export const ENV = 'MONOPACKER_ROOT_DIR' as const;

export const rootDirOption = new Option('-rd, --rootDir <dir>', 'Set a custom root directory').env(ENV);
