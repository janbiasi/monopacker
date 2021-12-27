import { LogLevelName } from './level';

export type Logger = {
	[key in LogLevelName]: (message: string) => void;
};
