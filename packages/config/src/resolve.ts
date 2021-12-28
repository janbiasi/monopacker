import type { Config } from './types';
import { cosmiconfig } from 'cosmiconfig';
import { validateConfig } from './validator';
import { patchConfigDefaults } from './defaults';
import { logger } from './logger';

const explorer = cosmiconfig('monopacker');

/**
 * Returns the local configuration object by using the common cosmiconfig explorer.
 * The method throws an error if no configuration could be found.
 * It will search in the following places:
 * - `package.json`, property `"monopacker"`
 * - `.monopackerrc` (JSON)
 * - `.monopackerrc.json`
 * - `.monopackerrc.y(a)ml`
 * - `.monopackerrc.(c)js`
 * - `monopacker.config.(c)js`
 * @returns {[Required<Config>, string]} A tuple with the configuration object and the path
 */
export const getConfig = async (rootDir: string): Promise<[Required<Config>, string]> => {
	try {
		logger.debug(`Searching for configuration file in ${rootDir}`);
		const result = await explorer.search(rootDir);

		if (result && result.isEmpty) {
			throw new Error(`Monopacker configuration is empty`)
		}

		if (result && result.config) {
			logger.debug(`Picking up configuration from ${result.filepath}`);
			validateConfig(result.config);

			return [patchConfigDefaults(result.config), result.filepath];
		}


		throw new Error(`No monopacker configuration found`);
	} catch (err) {
		const nativeErrorMessage = err instanceof Error ? err.message : `${err || 'unknown'}`;
		throw new Error(`Failed resolving monopacker configuration in ${rootDir}: ${nativeErrorMessage}`);
	}
};
