export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

export type Logger = {
	[key in LogLevel]: (message: string) => void;
};
