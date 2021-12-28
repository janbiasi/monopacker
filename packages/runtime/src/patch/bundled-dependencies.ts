import { parsePackage } from '@monopacker/resolver';
import { promises as fs } from 'fs';
import { logger } from '../logger';

export async function patchBundledDependencies(pkgPath: string) {
	const { pkg } = await parsePackage(pkgPath);
	const dependencies = pkg.dependencies || {};
	const bundledDependencies = pkg.bundledDependencies || [];
	const dependenciesKeys = Object.keys(dependencies);

	// no dependencies found, no need to patch
	if (!dependencies || dependenciesKeys.length === 0) {
		return;
	}

	// all dependencies are already declared as bundled dependencies, no need to patch
	if (dependenciesKeys.every(key => bundledDependencies.includes(key))) {
		return;
	}

	// patch package.json
	logger.info(`Patching missing bundled dependencies in ${pkg.name} (read xyz for more information)`);
	pkg.bundledDependencies = dependenciesKeys;
	await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2));
}
