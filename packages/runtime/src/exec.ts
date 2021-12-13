import { spawn } from 'child_process';
import { logger } from './logger';

export interface ExecOptions {
	command: string;
	args?: string[];
	cwd?: string;
	onData?: (data: string) => void;
}

export function exec({ command, args, cwd, onData }: ExecOptions): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		const rawCommandStr = `${command} ${args?.join(' ')}`;

		try {
			let stdout: string = '';
			let stderr: string = '';

			logger.debug(`Executing command: ${rawCommandStr}`);
			const runner = spawn(command, args, {
				cwd
			});

			runner.stdout.on('data', (data: any) => {
				stdout += data.toString();
				if (onData) {
					onData(`${data}`);
				}
			});

			runner.stderr.on('data', (data: any) => {
				stderr += data.toString();
			});

			runner.on('close', code => {
				if (code === 0) {
					resolve(stdout);
				} else {
					reject(new Error(`Command "${command} ${args?.join(' ')}" failed with code ${code}:\n\n${stderr}`));
				}
			});
		} catch (err) {
			if (`${err}`.indexOf('ENOENT')) {
				reject(new Error(`Command could not be exceuted, directory was not found (${cwd})`));
			}
		}
	});
}
