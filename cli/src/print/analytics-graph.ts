import { Graph } from '@monopacker/resolver';
import chalk from 'chalk';
import { logger } from '../logger';

const symbols = {
	level0: chalk.gray('├─'),
	level1: chalk.gray('├───'),
	startCorner: chalk.gray('┌'),
	endCorner: chalk.gray('└'),
};

export function printAnalyticsGraph(graph: Graph) {
	const localPkgKeys = Object.keys(graph.local);

	if (localPkgKeys.length === 0) {
		logger.warn('No local packages found');
		return;
	}

	console.log('\n');

	for (const localPkgName of localPkgKeys) {
		const localPkg = graph.local[localPkgName];
		const deps = graph.resolution[localPkgName];
		let hasDeps = false;

		console.info(`${symbols.startCorner} ${chalk.bold.magenta(localPkgName)}`);
		console.info(`${symbols.level0} Version: ${chalk.green(localPkg.version)}`);
		console.info(`${symbols.level0} Path: ${chalk.underline.gray(localPkg.path.replace(process.cwd(), '~'))}`);

		if (deps.external.length > 0) {
			console.info(`${symbols.level0} Externals: `);
			for (const external of deps.external) {
				console.info(`${symbols.level1} ${chalk.cyan(external)}`);
			}
		}

		console.info(`${symbols.level0} Dependencies: `);

		for (const depName in deps.peer) {
			console.info(`${symbols.level1} ${chalk.cyan(`${depName}@${deps.peer[depName]}`)} (Peer)`);
			hasDeps = true;
		}

		for (const depName in deps.internal) {
			console.info(`${symbols.level1} ${chalk.magenta(`${depName}@${deps.internal[depName]}`)}`);
			hasDeps = true;
		}

		for (const depName in deps.remote) {
			console.info(`${symbols.level1} ${depName}@${deps.remote[depName]}`);
			hasDeps = true;
		}

		if (hasDeps === false) {
			console.info(`${symbols.level1} ${chalk.yellow('None')}`);
		}

		console.info(`\n`);
	}
}
