import { dirname, join, resolve } from 'path';
import { promises as fs } from 'fs';
import type { PackConfig } from '@monopacker/config';
import { Graph, PackageDependencyMap, PackageJson, resolveTargetGraph, searchFiles } from '@monopacker/resolver';
import { createManagerTarball } from './commands/create-maanger-tarball';
import { sanitizePackageName } from './utils/sanitize-package-name';
import { mkdirp } from './utils/mkdirp';
import { getPerfDuration, getPerfTime } from './utils/perf';
import { MONOPACKER_OUT_DIR, MONOPACKER_PACKAGES_DIR } from './const';
import { logger } from './logger';

export async function pack(rootDir: string, packConfig: PackConfig, graph: Graph) {
	const perfStartPack = getPerfTime();
	const { source, copy, destination } = packConfig;
	logger.info(`Starting to pack target project "${source}" ...`);

	const { resolution, internals, name } = resolveTargetGraph(graph, source);
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

	const perfStartPackTars = getPerfTime();
	for (const internalPkgName in internals) {
		const internalPkg = graph.local[internalPkgName];
		const sanitizedPkgName = sanitizePackageName(internalPkgName);

		try {
			// TODO: Use dynamic manager
			await createManagerTarball('npm', dirname(internalPkg.path), absolutePackagesDestinationPath);

			// replicate the behaviour of NPM pack commands naming convention
			const tarballFileName = `${sanitizedPkgName}-${internalPkg.version}.tgz`;

			// save install path for local tarball as dependency
			tarballPackages[internalPkgName] = `./${MONOPACKER_PACKAGES_DIR}/${tarballFileName}`;

			logger.success(`Generated tarball artifact ${tarballFileName} for ${name}`);
		} catch (err) {
			logger.error(`Failed creating tarball archive for "${internalPkgName}":\n\n${err}`);
		}
	}
	const perfEndPackTars = getPerfDuration(perfStartPackTars);

	// copy all files
	const perfStartPackCopy = getPerfTime();
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
	const perfEndPackCopy = getPerfDuration(perfStartPackCopy);

	const perfEndPack = getPerfDuration(perfStartPack);

	const pkg: PackageJson = {
		name: `@packed/${safeName}`,
		version: graph.local[name].version,
		dependencies: {
			...tarballPackages,
			...graph.resolution[name].remote,
		},
		bundledDependencies: Object.keys(internals),
		monopackerMeta: {
			bundleId: safeName,
			packTarget: source,
			resolution,
			internals,
			perf: {
				main: perfEndPack,
				tars: perfEndPackTars,
				copy: perfEndPackCopy,
			},
		},
	};

	// write aggregated package.json to target directory as last item to ensure it is the final package.json
	await fs.writeFile(join(absoluteDestinationPath, 'package.json'), JSON.stringify(pkg, null, 2));

	logger.success(`Packed single target project "${source}" successfully to ${relativeDestinationPath}`);
}
