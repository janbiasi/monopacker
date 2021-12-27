import { Namespace, visualNamespaceWidth } from './namespace';
import { LoggableLevel } from './level';
import { Logger } from './types';
import { print } from './print';

const loglevels: LoggableLevel[] = ['debug', 'info', 'warn', 'error', 'success'];
const visualLogPad = loglevels.reduce((size, level) => Math.max(size, level.length), 0);

let logStack: string[] = [];

export function createLogger(namespace: Namespace): Logger {
	return loglevels.reduce(
		(logger, level) => ({
			...logger,
			[level]: (message: string) => {
				logStack.push(
					`${new Date().toISOString()} ${level.toUpperCase().padEnd(visualLogPad)} ${namespace.padEnd(
						visualNamespaceWidth
					)} ${message.replace(/\n/g, '')}`
				);
				print(namespace, message, level as LoggableLevel);
			},
		}),
		{} as Logger
	);
}

export function clearLogStack() {
	logStack = [];
}

export function getLogStack() {
	return logStack;
}
