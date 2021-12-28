import type { Command } from 'commander';
import { pack, run } from '@monopacker/runtime';
import { SourceArgument, sourceArgument } from './arguments/source';
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
} from './options';
import { getPackageGraph } from '@monopacker/resolver';

type PackCommandOptions = ExternalsOption & CopyOption & SilentOption & TraceOption & VerboseOption & RootDirOption;

export function attachPackCommand(program: Command) {
	program
		.command('pack')
		.description('Pack a target package inside a monorepo to a single standalone package.')
		.addArgument(sourceArgument)
		.addOption(externalsOption)
		.addOption(copyOption)
		.addOption(traceOption)
		.addOption(silentOption)
		.addOption(verboseOption)
		.addOption(rootDirOption)
		.action(async (source: SourceArgument, opts: PackCommandOptions) => {
			// no source present, we'll use the local monopacker config
			if (source === undefined) {
				await run(process.cwd());
				return process.exit(0);
			}

			// source present, we manually packa single package via `pack` runtime API
			const graph = await getPackageGraph(process.cwd(), {
				externals: opts.externals,
			});

			await pack(
				source,
				{
					source: source,
					copy: opts.copy,
				},
				graph
			);
		});
}
