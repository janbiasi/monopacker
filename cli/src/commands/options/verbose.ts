import { Option } from 'commander';
import { LoggableLevel, loggableLevels } from '@monopacker/log';
import { logger } from '../../logger';

export interface VerboseOption {
	verbose: LoggableLevel;
}

export const ENV = 'MONOPACKER_VERBOSE' as const;

export const verboseOption = new Option('-v, --verbose [level]', 'Configure output level')
	.env(ENV)
	// .default('info', 'Log everything above info level')
	.argParser((value?: string) => {
		const level = value || 'info';
		if (loggableLevels.includes(level as LoggableLevel)) {
			return level;
		}

		logger.warn(`Invalid verbose level detected: ${level}, defaulting to info`);
		return 'info';
	});
