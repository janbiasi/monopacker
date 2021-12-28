import type { Config } from './types';

/**
 * Basic validation for the monopacker configuration, it will throw an error in the following cases:
 * - If the configuration is not an object
 * - If the configuration is an object but has no required `packs` property
 * - If the `packs` property is not an array
 * - If the `packs` property is an array but has no required elements
 * @param {Config} config The configuration to validate
 */
export const validateConfig = (config: Partial<Config>): void => {
	if (typeof config !== 'object') {
		throw new Error('Monopacker configuration must be an object');
	}

	if (!config.packs) {
		throw new Error('Monopacker configuration must contain a property "packs"');
	}

	if (!Array.isArray(config.packs)) {
		throw new Error(`Monopacker packs must be an array, got ${typeof config.packs} instead`);
	}

	if (config.packs.length === 0) {
		throw new Error('Monopacker packs setting must contain at least one entry');
	}
};
