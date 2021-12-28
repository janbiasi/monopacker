export enum LogLevel {
	NONE = 0,
	DEBUG = 1,
	INFO = 2,
	WARN = 3,
	SUCCESS = 3,
	ERROR = 4
}

export type LogLevelName = 'none' | 'debug' | 'info' | 'warn' | 'error' | 'success';

export type LoggableLevel = Exclude<LogLevelName, 'none'>;

export const loggableLevels: readonly LoggableLevel[] = ['debug', 'info', 'warn', 'error', 'success'];
