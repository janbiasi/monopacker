import * as debug from 'debug';
import { IPackerOptions, HookPhase } from "../types";
import { Packer, DEFAULT_PACKED_PATH } from "../Packer";
import { countMsg, displayPath } from "../utils";

const CWD = process.cwd();
const log = debug('packer');

/**
 * Creates debugging hooks which will log the progress and possible issues.
 * @param {Pick<IPackerOptions, 'target' | 'cwd' | 'source'>} opts
 */
export function useDebugHooks(opts: Pick<IPackerOptions, 'target' | 'cwd' | 'source'>): IPackerOptions['hooks'] {
	return {
		[HookPhase.INIT]: [
			async () => {
				log(
					`Initialized packer v${Packer.version} for ${displayPath(
						opts.cwd || CWD,
						opts.source
					)}`
				)

				log(`Setting packing output to ${opts.target || `${DEFAULT_PACKED_PATH} (default)`}`);
			}
		],
		[HookPhase.PREANALYZE]: [
			async () => {
				log('Fetching analytics data from package ...');
			}
		],
		[HookPhase.POSTANALYZE]: [
			async (_packer, { analytics, fromCache, generateAnalyticsFile }) => {
				if (fromCache) {
					log('Analytics served from cache');
				} else {
					log('Analytics successfully written to <target>/monopacker.analytics.json');
				}

				if (!generateAnalyticsFile) {
					log('Skip writing analytics file to output');
				}

				log(
					`Found ${countMsg(analytics.dependencies.external, 'external package')} to install via NPM`
				);
				log(`Found ${countMsg(analytics.dependencies.internal, 'internal package')} to copy`);
				log(
					`Found ${countMsg(analytics.dependencies.peer, 'aggregated peer package')} to include in production`
				);
			}
		],
		[HookPhase.PREINSTALL]: [
			async (_packer, { name, dependencies }) => {
				log(`Installing ${countMsg(dependencies, 'package')} in ${name} ...`);
			}
		],
		[HookPhase.POSTINSTALL]: [
			async (_packer, { dependencies }) => {
				log(`Production packages have been installed (${countMsg(dependencies, 'package')})`);
			}
		],
		[HookPhase.PRELINK]: [
			async (_packer, entries) => {
				log(`Found ${countMsg(entries, 'entry', 'entries')} to copy`);
			}
		],
		[HookPhase.POSTLINK]: [
			async (_packer, entries) => {
				log(`Linked ${countMsg(entries, 'monorepository package')} successfully`);
			}
		],
		[HookPhase.PACKED]: [
			async (_packer, { artificalPackage }) => {
				log(`Packed hash is ${artificalPackage.monopacker.hash}`);
				log(`Application ${artificalPackage.name} packed successfully!`);
			}
		]
	}
}
