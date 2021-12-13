import { dirname, join, resolve } from 'path';
import { promises as fs } from 'fs';
import { PackConfig } from '@monopacker/config';
import { getLogStack } from '@monopacker/log';
import { Graph, PackageDependencyMap, PackageJson, resolveTargetGraph, searchFiles } from '@monopacker/resolver';
import { createManagerTarball } from './commands/create-maanger-tarball';
import { sanitizePackageName } from './utils/sanitize-package-name';
import { mkdirp } from './utils/mkdirp';
import { logger } from './logger';
import { MONOPACKER_OUT_DIR, MONOPACKER_PACKAGES_DIR } from './const';

export async function pack(rootDir: string, packConfig: PackConfig, graph: Graph) {
	const perfStartPack = process.hrtime();
	const { source, copy, destination } = packConfig;
	logger.info(`Target ${source} -> ${destination}`);

	const { resolution, resolved, name } = resolveTargetGraph(graph, source);
	const safeName = sanitizePackageName(name);

	const sourcePackagePath = dirname(graph.local[name].path);
	const relativeDestinationPath = `${MONOPACKER_OUT_DIR}/${safeName}`;
	const relativePackagesDestinationPath = `${relativeDestinationPath}/${MONOPACKER_PACKAGES_DIR}`;
	const absoluteDestinationPath = join(rootDir, relativeDestinationPath);
	const absolutePackagesDestinationPath = join(rootDir, relativePackagesDestinationPath);

	// ensure target path exists
	await mkdirp(absoluteDestinationPath);
	await mkdirp(absolutePackagesDestinationPath);

	const tarballPackages: PackageDependencyMap = {};

	const perfStartPackTars = process.hrtime();
	for (const internalPkgName in resolved.internal) {
		const internalPkg = graph.local[internalPkgName];
		const sanitizedPkgName = sanitizePackageName(internalPkgName);

		try {
			// TODO: Use dynamic manager
			await createManagerTarball('npm', dirname(internalPkg.path), absolutePackagesDestinationPath);

			// replicate the behaviour of NPM pack commands naming convention
			const tarballFileName = `${sanitizedPkgName}-${internalPkg.version}.tgz`;

			// save install path for local tarball as dependency
			tarballPackages[internalPkgName] = `./${MONOPACKER_PACKAGES_DIR}/${tarballFileName}`;

			logger.info(`Generated tarball artifact ${tarballFileName} for ${name}`);
		} catch (err) {
			logger.error(`Failed creating tarball archive for "${internalPkgName}":\n\n${err}`);
		}
	}
	const perfEndPackTars = process.hrtime(perfStartPackTars);

	// copy all files
	const perfStartPackCopy = process.hrtime();
	const filesToCopy = await searchFiles(sourcePackagePath, copy || []);
	if (filesToCopy.length > 0) {
		logger.info(`Copying ${filesToCopy.length} files for ${name}`);
		for (const file of filesToCopy) {
			await fs.copyFile(resolve(rootDir, sourcePackagePath, file), join(absoluteDestinationPath, file));
		}
	} else {
		logger.warn(
			`No files to copy for ${name}, this is usually not what you want. Please check your configuration to include sources for your application.`
		);
	}
	const perfEndPackCopy = process.hrtime(perfStartPackCopy);

	const perfEndPack = process.hrtime(perfStartPack);

	const pkg: PackageJson = {
		name: `@packed/${safeName}`,
		version: graph.local[name].version,
		dependencies: {
			...resolution.remote,
			...tarballPackages
		},
		bundledDependencies: [...Object.keys(resolution.internal), ...Object.keys(resolution.remote)],
		monopackerMeta: {
			source,
			name,
			safeName,
			resolution,
			perf: {
				// TODO: Outsource calc to a util + round to .3 precision
				main: perfEndPack[0] + perfEndPack[1] / Math.pow(10, 9),
				tars: perfEndPackTars[0] + perfEndPackTars[1] / Math.pow(10, 9),
				copy: perfEndPackCopy[0] + perfEndPackCopy[1] / Math.pow(10, 9)
			}
		}
	};

	await fs.writeFile(join(absoluteDestinationPath, 'package.json'), JSON.stringify(pkg, null, 2));

	// TODO: do this in the root command for the whole packing process, not just for the target
	await fs.writeFile(join(absoluteDestinationPath, 'monopacker.log'), getLogStack().join('\n'));
}
