#!/usr/bin/env node
'use strict';

import { resolve } from 'path';
import * as commander from 'commander';
import { analyze, pack, validate } from './commands';
import { AdapterLerna } from '../adapter/Lerna';

const program = new commander.Command();
const sourcePkg = require('../../package.json');

program
	.version(sourcePkg.version || 'nA.')
	.option('-d, --debug', 'Enable debug mode', false)
	.option('-v, --verbose', 'Silent mode', false)
	.allowUnknownOption(false);

program
	.command('validate <source>')
	.alias('v')
	.description('Checks if a package is packable by resolving all packages theoretically')
	.option('-r, --root <dir>', 'Set a custom root directory, default: process.cwd()', process.cwd())
	.action(async (source, { root, verbose = false }) => {
		await validate(resolve(root), source);
	})
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('');
		console.log('  $ monpacker validate ./packages/main');
		console.log('  $ monopacker v packages/main');
	});

program
	.command('analyze <source>')
	.alias('a')
	.description('Analyze a packable package')
	.option('-r, --root <dir>', 'Set a custom root directory, default: process.cwd()', process.cwd())
	.action(async (source, { root, verbose = false }) => {
		const analytics = await analyze(resolve(root), source);
		console.log('');
		console.log(JSON.stringify(analytics, null, 2));
		console.log('');
	})
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('');
		console.log('  $ monpacker analyze ./packages/main');
		console.log('  $ monopacker a packages/main');
	});

program
	.command('pack <source> [target]')
	.alias('p')
	.description('Pack an application from a monorepository')
	.option('-r, --root <dir>', 'Set a custom root directory, default: process.cwd()', process.cwd())
	.option('-c, --copy [dirs]', 'Custom copy settings, pass in format "dir1,!notDir2"')
	.option('-nc, --noCache', 'Disable caching', false)
	.option('-np, --npm-pack-target', 'NPM Pack the final packed output', true)
	.option('-i, --installer', 'Use an installer file instead of inline command', false)
	.option('-a, --adapter [name]', 'Set adapter for packing, allowed: lerna, nx', /^(lerna|nx)$/i, 'lerna')
	.action(
		async (
			source,
			target,
			{
				noCache = false,
				npmPackTarget = false,
				installer = false,
				adapter,
				copy,
				root,
				debug = false,
				verbose = false
			}
		) => {
			if (adapter) {
				console.warn(
					`Custom adapters are not supported yet, you passed ${adapter} but lerna will be used atm.`
				);
			}

			await pack({
				cwd: resolve(root),
				source,
				target,
				packTarget: npmPackTarget,
				createInstaller: installer,
				debug: verbose ? false : debug,
				copy: copy ? copy.split('') : undefined,
				cache: !noCache,
				internals: [],
				adapter: AdapterLerna
			});
		}
	)
	.on('--help', () => {
		console.log('');
		console.log('Examples:');
		console.log('');
		console.log('  $ monpacker pack ./packages/main ./packed/main');
		console.log('  $ monopacker p packages/main');
	});

// error on unknown commands
program.on('command:*', () => {
	console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
	process.exit(1);
});

(async () => {
	program.parse(process.argv);
})();

// TEST: node -r ./node_modules/ts-node/register src/bin/monopacker-cli.ts pack packages/main --root ./test/fixtures/basic/ --noCache
// TEST: node ./build/bin/monopacker-cli pack packages/main --root ./test/fixtures/basic/ -a nx
// TEST: node -r ./node_modules/ts-node/register src/bin/monopacker-cli.ts analyze  ./test/fixtures/basic/packages/main
