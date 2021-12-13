import type { PackageManager } from '@monopacker/config';
import { exec } from '../exec';

export async function createManagerTarball(manager: PackageManager, sourcePath: string, destinationPath: string) {
	const specificManagerArgs =
		manager === 'npm'
			? // NPM case
			  ['pack', sourcePath, '--pack-destination', destinationPath]
			: // Yarn case
			  ['pack', sourcePath, '--out', destinationPath];

	await exec({
		command: manager,
		args: specificManagerArgs,
		cwd: sourcePath,
	});
}
