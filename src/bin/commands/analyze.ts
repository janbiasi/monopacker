import { Packer } from '../../Packer';
import ora from 'ora';
import { displayPath } from '../../utils';

export async function analyze(cwd: string, source: string) {
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
			],
			preanalyze: [
				async () => {
					spinner.text = 'Fetching analytics data from package ...';
				}
			],
			postanalyze: [
				async () => {
					spinner.succeed('Analytics successfully aggregated');
					spinner.info('Skip writing analytics file to output');
				}
			]
		}
	});

	const result = await packer.analyze(false);
	spinner.succeed(`Sent analytics to CLI`);

	return result;
}
