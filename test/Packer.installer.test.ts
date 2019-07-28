import { resolve, join } from 'path';
import { readFile } from 'fs-extra';
import { Packer } from '../src/Packer';
import { createTestPackerFor } from './utils';

const BASIC_CWD = resolve(__dirname, 'fixtures/basic');

const createTestPackerForBasic = (hooks?: Packer['hooks']) =>
	createTestPackerFor(BASIC_CWD, 'packages/main', hooks, {
		createInstaller: true
	});

describe('Packer', () => {
	describe('Lerna', () => {
		describe('use installer', () => {
			it('should generate an installer file correctly', async () => {
				const packer = createTestPackerForBasic();
				await packer.pack();

				const generatedPkg = require(join(BASIC_CWD, 'temp', 'package.json'));

				expect(generatedPkg).toBeTruthy();
				expect(generatedPkg).toMatchSnapshot();
				expect(generatedPkg.scripts.postinstall).toContain('node ./monopacker.installer.js');

				try {
					const installerContents = await readFile(join(BASIC_CWD, 'temp', 'monopacker.installer.js'));
					expect(installerContents.toString()).toMatchSnapshot();
				} catch (e) {
					throw new Error('Installer file does not exist!');
				}
			});
		});
	});
});
