import { resolve } from 'path';
import { promises as fs } from 'fs';
import { getConfig } from '@monopacker/config';
import { getPackageGraph } from '@monopacker/resolver';
import { logger } from './logger';
import { pack } from './pack';
import { mkdirp } from './utils/mkdirp';
import { getLogStack } from '@monopacker/log';

// TODO: We need a good way to patch defaults in the config

export async function run(entryDir: string = process.cwd()) {
	logger.debug(`Invoking monopacker in directory ${entryDir}`);
	const [config] = await getConfig(entryDir);
	const rootDir = config.rootDir ? resolve(entryDir, config.rootDir) : entryDir;

	if (config.rootDir) {
		process.chdir(rootDir);
		logger.info(`Using custom root directory ${rootDir}`);
	}

	try {
		const packageGraph = await getPackageGraph(rootDir, config.resolver);
		await mkdirp('packed');

		// for (const localPkgName in packageGraph.local) {
		// 	const localPkg = packageGraph.local[localPkgName];

		// 	// we need to ensure that "bundledDependencies" of all internal packages are set correctly
		// 	// as we rely on the npm/yarn "pack" command mechanism.
		// 	await patchBundledDependencies(localPkg.path);
		// }

		for (const packConfig of config.packs) {
			await pack(rootDir, packConfig, packageGraph);
		}

		logger.success(`📦 Packing complete.`);
	} catch (err) {
		// print a log message if we receive an error while running
		// and throw the error afterwards for better context-awareness
		logger.error(`💥 Detected error while packing, forwarding:\n\n${err}`);
		// write the complete log stack to the log file for debugging purposes
		await fs.writeFile('monopacker.log', getLogStack().join('\n'));
		throw err;
	}

	// write the complete log stack to the log file
	await fs.writeFile('monopacker.log', getLogStack().join('\n'));
}
