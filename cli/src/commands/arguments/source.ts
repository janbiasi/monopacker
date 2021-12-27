import { Argument } from 'commander';
import { entrySourceProcessing } from '../processing/entry-source';

export type SourceArgument = string | undefined;

export const sourceArgument = new Argument(
	'[source]',
	'The package name or path to the source to pack. If not specified, it will resolve a local config.'
)
	.default(undefined)
	.argParser(entrySourceProcessing);
