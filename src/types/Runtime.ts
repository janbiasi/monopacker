import { DependenciesLike, ArtificalPackage, InternalPackageList } from './Package';
import { IAdapterConstructable } from './Adapter';
import { Packer } from '../Packer';

export enum HookPhase {
	INIT = 'init',
	PREANALYZE = 'preanalyze',
	POSTANALYZE = 'postanalyze',
	PRECOPY = 'precopy',
	POSTCOPY = 'postcopy',
	PRELINK = 'prelink',
	POSTLINK = 'postlink',
	PACKED = 'packed'
}

export interface IPackerOptions {
	/**
	 * Source to pack (root is cwd)
	 */
	source: string;
	/**
	 * Enable to automatically install the packed project, default: `false`
	 */
	autoinstall?: boolean;
	/**
	 * Target for the packed app (root is cwd), default:
	 */
	target?: string;
	/**
	 * Monorepository type, at the moment only lerna support, default: auto-detected
	 */
	type?: 'lerna' | 'nx';
	/**
	 * Enable or disable the cache, default: `true` (enabled)
	 */
	cache?: boolean;
	/**
	 * Working directory, can be changed, default: `process.cwd()`
	 */
	cwd?: string;
	/**
	 * TODO: Expressions to match package names which are internally defined (optional)
	 * Can be used for eg. rewriting globally available modules such as 'react-scripts'
	 * to provide a custom implementation for.
	 */
	internals?: string[];
	/**
	 * The adapter for the analytics process, default: `'lerna'`
	 */
	adapter?: IAdapterConstructable;
	/**
	 * Optional copy settings, default: `['**']`
	 */
	copy?: string[];
	/**
	 * Enable debugging, default: false
	 */
	debug?: boolean;
	/**
	 * Decide if you want an installer file (`monopacker.installer.js`)
	 * as postinstall process or not, default: `false`
	 */
	createInstaller?: boolean;
	/**
	 * Decide if you want your target also packed or not, default: `false`
	 */
	packTarget?: boolean;
	/**
	 * Define opt-in hooks for certain steps, default: {}
	 */
	hooks?: Partial<{
		[HookPhase.INIT]: Array<(packer: Packer) => Promise<any>>;
		[HookPhase.PREANALYZE]: Array<(packer: Packer) => Promise<any>>;
		[HookPhase.POSTANALYZE]: Array<
			(
				packer: Packer,
				information: {
					analytics: IAnalytics;
					generateAnalyticsFile: boolean;
					fromCache: boolean;
				}
			) => Promise<any>
		>;
		[HookPhase.PRECOPY]: Array<(packer: Packer) => Promise<any>>;
		[HookPhase.POSTCOPY]: Array<(packer: Packer, copiedFiles: string[]) => Promise<any>>;
		[HookPhase.PRELINK]: Array<(packer: Packer, entries: InternalPackageList) => Promise<any>>;
		[HookPhase.POSTLINK]: Array<(packer: Packer, entries: InternalPackageList) => Promise<any>>;
		// [HookPhase.PREINSTALL]: Array<(packer: Packer, artificalPkg: ArtificalPackage) => Promise<any>>;
		// [HookPhase.POSTINSTALL]: Array<(packer: Packer, artificalPkg: ArtificalPackage) => Promise<any>>;
		[HookPhase.PACKED]: Array<
			(
				packer: Packer,
				resume: {
					analytics: IAnalytics;
					artificalPackage: ArtificalPackage;
					copiedFiles: string[];
				}
			) => Promise<any>
		>;
	}>;
}

export interface IAnalytics {
	dependencies: {
		internal: InternalPackageList;
		external: DependenciesLike;
		peer: DependenciesLike;
	};
	graph?: {
		[packageName: string]: IAnalytics['graph'] | Record<string, string>;
	};
}

export interface IAnalyticsWithIntegrity extends IAnalytics {
	integrity: string;
}
