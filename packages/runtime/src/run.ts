import { resolve } from 'path';
import { promises as fs } from 'fs';
import { getConfig } from '@monopacker/config';
import {
	getPackageGraph,
	getPackageResolutions,
	resolveTargetGraph,
	resolveTargetPackageName
} from '@monopacker/resolver';
import { patchBundledDependencies } from './patch/bundled-dependencies';
import { logger } from './logger';
import { pack } from './pack';
import { mkdirp } from './utils/mkdirp';

// TODO: We need a good way to patch defaults in the config

export async function run(entryDir: string = process.cwd()) {
	const [config, configLocation] = await getConfig(entryDir);
	const rootDir = config.rootDir ? resolve(entryDir, config.rootDir) : entryDir;
	if (config.rootDir) {
		process.chdir(rootDir);
	}

	logger.info(`Using config from ${configLocation}`);

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
}
