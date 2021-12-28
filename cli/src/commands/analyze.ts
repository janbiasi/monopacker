import path from 'path';
import type { Command } from 'commander';
import { Config, getConfig, PackConfig, ResolverConfig } from '@monopacker/config';
import { getPackageGraph } from '@monopacker/resolver';
import {
	externalsOption,
	ExternalsOption,
	silentOption,
	SilentOption,
	traceOption,
	TraceOption,
	verboseOption,
	VerboseOption,
	copyOption,
	CopyOption,
	rootDirOption,
	RootDirOption,
	jsonOption,
	JsonOption,
	visualOption,
	VisualOption,
} from './options';
import { SourceArgument, sourceArgument } from './arguments/source';
import { logger } from '../logger';
import { ExitCode } from '../exit-codes';
import { printAnalyticsGraph } from '../print/analytics-graph';

type AnalyzeCommandOptions = ExternalsOption &
	VisualOption &
	CopyOption &
	SilentOption &
	TraceOption &
	VerboseOption &
	RootDirOption &
	JsonOption;

export function attachAnalyzeCommand(program: Command) {
	program
		.command('analyze')
		.description('Analyze the current repository based on the pack configuration found')
		.addArgument(sourceArgument)
		.addOption(externalsOption)
		.addOption(copyOption)
		.addOption(traceOption)
		.addOption(silentOption)
		.addOption(verboseOption)
		.addOption(rootDirOption)
		.addOption(jsonOption)
		.addOption(visualOption)
		.action(async (source: SourceArgument, opts: AnalyzeCommandOptions) => {
			logger.debug(`Analyzing package tree ...`);

			const configuredRootDir = opts.rootDir || './';
			let rootDir = path.resolve(process.cwd(), configuredRootDir);
			let config: Config | undefined;
			let resolverConfig: ResolverConfig = {
				externals: opts.externals,
			};

			if (source === undefined) {
				logger.info(`No source specified, try using local config`);

				try {
					const [localConfig] = await getConfig(rootDir);
					config = localConfig;
					resolverConfig = localConfig.resolver;
					rootDir = path.resolve(process.cwd(), localConfig.rootDir || configuredRootDir);
				} catch (error) {
					logger.error(`${error}`);
					process.exit(ExitCode.CONFIG_NOT_FOUND);
				}
			}

			const graph = await getPackageGraph(rootDir, resolverConfig);

			if (opts.visual) {
				try {
					const visualizer = await import('@monopacker/visualizer');
					await visualizer.visualize(
						{
							resolver: resolverConfig,
							packs: config
								? config.packs
								: ([
										{
											source: source,
										},
								  ] as PackConfig[]),
						},
						graph
					);
					logger.success(`Generated visual representation successfully`);
					process.exit(0);
				} catch (error) {
					logger.error(`${error}`);
				}
			}

			if (opts.json) {
				console.info(JSON.stringify(graph, null, 2));
			} else {
				printAnalyticsGraph(graph);
			}
		});
}
