import { symbols } from './symbols';
import { LogLevel } from './types';
import chalk, { Chalk } from 'chalk';
import { visualNamespaceWidth } from './namespace';

const levelSymbolMap: Record<LogLevel, string> = {
	debug: symbols.circleDotted,
	info: symbols.info,
	warn: symbols.warning,
	error: symbols.cross,
	success: symbols.tick
};

const colorToLevelMap: Record<LogLevel, Chalk> = {
	debug: chalk.gray,
	info: chalk.cyan,
	warn: chalk.yellow,
	error: chalk.red,
	success: chalk.green
};

export function print(namespace: string, message: string, level: LogLevel) {
	const cl = colorToLevelMap[level];
	const levelSymbol = levelSymbolMap[level];
	const colorizeMessage = level === 'error' || level === 'warn';

	console.log(
		`${cl(levelSymbol)} ${cl(namespace.padEnd(visualNamespaceWidth))} ${colorizeMessage ? cl(message) : message}`
	);
}
