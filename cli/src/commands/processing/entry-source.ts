/**
 * @see https://github.com/tj/commander.js#custom-option-processing
 * @param value
 * @returns
 */
export function entrySourceProcessing(value?: string) {
	if (!value) {
		return undefined;
	}

	if (value.startsWith('--') || value.startsWith('-')) {
		// no argument specified, received an option instead, return undefined as default
		return undefined;
	}

	return value;
}
