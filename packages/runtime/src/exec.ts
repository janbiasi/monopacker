import { spawn } from 'child_process';

export interface ExecOptions {
	command: string;
	args?: string[];
	cwd?: string | URL;
	onData?: (data: string) => void;
}

export function exec({ command, args, cwd, onData }: ExecOptions): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		try {
			let stdout: string = '';
			let stderr: string = '';

			const runner = spawn(command, args, {
				/**
				 * Allow seting current working directory manuall to not rely on `process.cwd()`
				 */
				cwd,
				/**
				 * `spawn` runs without shell per default which leads to a lot of failures with certain commands
				 * @see https://nodejs.org/docs/latest-v14.x/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
				 * @see https://stackoverflow.com/questions/37459717/error-spawn-enoent-on-windows/37487465
				 */
				shell: true,
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

			runner.on('close', (code) => {
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
