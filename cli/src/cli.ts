import chalk from 'chalk';
import { Command } from 'commander';
import { logger } from './logger';
import { getVersion } from './version';
import { attachAnalyzeCommand } from './commands/analyze';
import { attachPackCommand } from './commands/pack';
import { ExitCode } from './exit-codes';

export function cli(argv: string[]): Promise<Command> {
	const program = new Command()
		// .showSuggestionAfterError()
		.name('monopacker')
		.version(getVersion())
		.configureHelp({
			sortSubcommands: true,
			subcommandTerm: (cmd) => cmd.name(),
		})
		.configureOutput({
			writeErr: (str) => logger.error(`${str}`),
		})
		.addHelpText(
			'after',
			`

Example call:
  $ monopacker pack --verbose debug
  $ monopacker analyze --visual
  $ monopacker pack @project/package-name --silent
  $ monopacker pack @project/package-name --externals jquery,lodash`
		);

	// integrate sub-command "pack" (previously called directly)
	attachPackCommand(program);

	// integrate sub-command "analyze"
	attachAnalyzeCommand(program);

	// attach exit handlers
	process.on('exit', () => {
		const exitCode = process.exitCode;
		if (exitCode && exitCode > 0) {
			logger.error(
				`Process exited with non-zero exit code ${
					process.exitCode || 'n.A.'
				}, find more details on ${chalk.underline(
					`https://github.com/janbiasi/monopacker/wiki/cli#exit-code-${exitCode}`
				)}`
			);
		}
	});

	process.on('SIGINT', () => {
		logger.debug(`Process terminated by the user, received SIGINT event`);
		process.exit(0);
	});

	// launch the main CLI
	try {
		return program.parseAsync(argv);
	} catch (error) {
		logger.error(`${error}`);
		process.exit(ExitCode.UNKNOWN_ERROR);
	}
}
