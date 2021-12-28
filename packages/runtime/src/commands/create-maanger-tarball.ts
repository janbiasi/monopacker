import type { PackageManager } from '@monopacker/config';
import { exec } from '../exec';
import { logger } from '../logger';

export async function createManagerTarball(manager: PackageManager, sourcePath: string, destinationPath: string) {
	const specificManagerArgs =
		manager === 'npm'
			? // NPM case
			  ['pack', sourcePath, '--pack-destination', destinationPath]
			: // Yarn case
			  ['pack', sourcePath, '--out', destinationPath];

	logger.debug(
		`Attempting to create tarball for ${sourcePath.replace(process.cwd(), '~')} via "${manager} pack" ...`
	);

	await exec({
		command: manager,
		args: specificManagerArgs,
		cwd: sourcePath,
	});
}
