import { symbols } from './symbols';
import chalk, { Chalk } from 'chalk';
import { visualNamespaceWidth } from './namespace';
import { LoggableLevel } from './level';

const levelSymbolMap: Record<LoggableLevel, string> = {
	debug: symbols.circleDotted,
	info: symbols.info,
	warn: symbols.warning,
	error: symbols.cross,
	success: symbols.tick,
};

const colorToLevelMap: Record<LoggableLevel, Chalk> = {
	debug: chalk.gray,
	info: chalk.cyan,
	warn: chalk.yellow,
	error: chalk.red,
	success: chalk.green,
};

const moduleInitTime = process.hrtime.bigint();

export function print(namespace: string, message: string, level: LoggableLevel) {
	const cl = colorToLevelMap[level];
	const levelSymbol = levelSymbolMap[level];
	const colorizeMessage = level === 'error' || level === 'warn';
	const perfDiff = (process.hrtime.bigint() - moduleInitTime) / BigInt(1e6);
	const addPerfDiff = namespace !== 'cli'; // we don't want to show perf infos on CLI logs

	console.log(
		`${cl(levelSymbol)} ${cl(namespace.padEnd(visualNamespaceWidth))} ${colorizeMessage ? cl(message) : message} ${
			addPerfDiff ? chalk.gray(`+${perfDiff}ms`) : ''
		}`
	);
}
