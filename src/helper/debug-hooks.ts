import { IPackerOptions, HookPhase } from "../types";
import { Packer, DEFAULT_PACKED_PATH } from "../Packer";
import { countMsg, displayPath } from "../utils";

const CWD = process.cwd();
let installTimer: [number, number];

/**
 * Creates debugging hooks which will log the progress and possible issues.
 * @param {Pick<IPackerOptions, 'target' | 'cwd' | 'source'>} opts
 */
export function useDebugHooks(opts: Pick<IPackerOptions, 'target' | 'cwd' | 'source'>): IPackerOptions['hooks'] {
	return {
		[HookPhase.INIT]: [
			async () => {
				console.log(
					`Initialized packer v${Packer.version} for ${displayPath(
						opts.cwd || CWD,
						opts.source
					)}`
				)

				console.log(`Setting packing output to ${opts.target || `${DEFAULT_PACKED_PATH} (default)`}`);
			}
		],
		[HookPhase.PREANALYZE]: [
			async () => {
				console.log('Fetching analytics data from package ...');
			}
		],
		[HookPhase.POSTANALYZE]: [
			async (_packer, { analytics, fromCache, generateAnalyticsFile }) => {
				if (fromCache) {
					console.log('Analytics served from cache');
				} else {
					console.log('Analytics successfully written to <target>/monopacker.analytics.json');
				}

				if (!generateAnalyticsFile) {
					console.log('Skip writing analytics file to output');
				}

				console.log(
					`Found ${countMsg(analytics.dependencies.external, 'external package')} to install via NPM`
				);
				console.log(`Found ${countMsg(analytics.dependencies.internal, 'internal package')} to copy`);
				console.log(
					`Found ${countMsg(analytics.dependencies.peer, 'aggregated peer package')} to include in production`
				);
			}
		],
		[HookPhase.PREINSTALL]: [
			async (_packer, { name, dependencies }) => {
				console.log(`Installing ${countMsg(dependencies, 'package')} in ${name} ...`);
				installTimer = process.hrtime();
			}
		],
		[HookPhase.POSTINSTALL]: [
			async (_packer, { dependencies }) => {
				const [installationTimeInSeconds] = process.hrtime(installTimer);
				console.log(`Production packages have been installed (${countMsg(dependencies, 'package')} in ~${installationTimeInSeconds}s)`);
			}
		],
		[HookPhase.PRELINK]: [
			async (_packer, entries) => {
				console.log(`Found ${countMsg(entries, 'entry', 'entries')} to copy`);
			}
		],
		[HookPhase.POSTLINK]: [
			async (_packer, entries) => {
				console.log(`Linked ${countMsg(entries, 'monorepository package')} successfully`);
			}
		],
		[HookPhase.PACKED]: [
			async (_packer, { artificalPackage }) => {
				console.log(`Packed hash is ${artificalPackage.monopacker.hash}`);
				console.log(`Application ${artificalPackage.name} packed successfully!`);
			}
		]
	}
}
