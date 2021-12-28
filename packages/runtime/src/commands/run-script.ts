import type { PackageManager } from '@monopacker/config';
import { exec } from '../exec';
import { logger } from '../logger';

export async function runScript(manager: PackageManager, sourcePath: string, script: string, args: string[]) {
	logger.debug(`Running script "${script}" via "${manager}" ...`);
	const managerSpecificFlags = manager === 'npm' ? ['--if-present'] : [];

	await exec({
		command: manager,
		args: ['run', script, ...managerSpecificFlags, ...args],
		cwd: sourcePath,
	});

	// Sidenote: yarn will fail if the script does not exist
}
