/**
 * @see https://github.com/tj/commander.js#custom-option-processing
 * @param value
 * @returns
 */
export function commaSeparatedListProcessing(value?: string) {
	if (value) {
		return value.split(',');
	}

	return [];
}
