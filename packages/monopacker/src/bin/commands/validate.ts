import { Packer } from '../../Packer';
import ora from 'ora';
import { displayPath } from '../../utils';

export async function validate(cwd: string, source: string) {
	const spinner = ora('Creating packer instance');
	spinner.frame();
	spinner.start();

	const packer = new Packer({
		cwd,
		source,
		target: 'packed',
		hooks: {
			init: [
				async () => {
					spinner.succeed(`Initialized packer v${Packer.version} for ${displayPath(process.cwd(), source)}`);
				}
			]
		}
	});

	try {
		await packer.validate();
		spinner.succeed(`Your project is ready to get packed!`);
	} catch (err) {
		spinner.fail(`${err || 'Project contains issues, please check the docs'}`);
	}
}
