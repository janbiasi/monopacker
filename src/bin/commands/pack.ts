import ora from 'ora';
import { relative } from 'path';
import { Packer, DEFAULT_PACKED_PATH } from '../../Packer';
import { IPackerOptions } from '../../types';
import { countMsg, displayPath } from '../../utils';

const CWD = process.cwd();

export async function pack(opts: IPackerOptions) {
	let spinner = ora('Creating packer instance').start();
	let installTimer: [number, number];

	const packer = new Packer({
		cwd: opts.cwd,
		source: opts.source,
		target: opts.target,
		copy: opts.copy,
		cache: opts.cache,
		hooks: {
			init: [
				async () => {
					spinner.succeed(
						`Initialized packer v${Packer.version} for ${displayPath(
							opts.cwd || CWD,
							opts.source
						)}`
					);

					if (opts.cwd) {
						spinner.info(`Using custom root directory ~${relative(CWD, opts.cwd)}`);
					}

					spinner.info(`Setting packing output to ${opts.target || `${DEFAULT_PACKED_PATH} (default)`}`);
				}
			],
			preanalyze: [
				async () => {
					spinner.text = 'Fetching analytics data from package ...';
				}
			],
			postanalyze: [
				async (_packer, { analytics, fromCache, generateAnalyticsFile }) => {
					if (fromCache) {
						spinner.succeed('Analytics served from cache');
					} else {
						spinner.succeed('Analytics successfully written to <target>/monopacker.analytics.json');
					}

					if (!generateAnalyticsFile) {
						spinner.info('Skip writing analytics file to output');
					}

					spinner.succeed(
						`Found ${countMsg(analytics.dependencies.external, 'external package')} to install via NPM`
					);
					spinner.succeed(`Found ${countMsg(analytics.dependencies.internal, 'internal package')} to copy`);
					spinner.succeed(
						`Found ${countMsg(analytics.dependencies.peer, 'aggregated peer package')} to include in production`
					);
				}
			],
			preinstall: [
				async (_packer, { name, dependencies }) => {
					spinner = spinner.start(`Installing ${countMsg(dependencies, 'package')} in ${name} ...`);
					installTimer = process.hrtime();
				}
			],
			postinstall: [
				async (_packer, { dependencies }) => {
					const [installationTimeInSeconds] = process.hrtime(installTimer);
					spinner.succeed(`Production packages have been installed (${countMsg(dependencies, 'package')} in ~${installationTimeInSeconds}s)`);
				}
			],
			prelink: [
				async (_packer, entries) => {
					spinner.text = `Found ${countMsg(entries, 'entry', 'entries')} to copy`;
				}
			],
			postlink: [
				async (_packer, entries) => {
					spinner.succeed(`Linked ${countMsg(entries, 'monorepository package')} successfully`);
				}
			],
			packed: [
				async (_packer, { artificalPackage }) => {
					spinner.info(`Packed hash is ${artificalPackage.monopacker.hash}`);
					spinner.succeed(`Application ${artificalPackage.name} packed successfully!`);
				}
			]
		}
	});

	try {
		return await packer.pack();
	} catch (err) {
		spinner.fail(`${err}`);
		process.exit(1);
	}
}
