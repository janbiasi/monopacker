import { TaperFunction } from '../Taper';
import { DependenciesLike } from './Package';
import { LernaPackageList } from './Lerna';

export enum HookPhase {
	INIT = 'init',
	PREANALYZE = 'preanalyze',
	POSTANALYZE = 'postanalyze',
	PRECOPY = 'precopy',
	POSTCOPY = 'postcopy',
	PREINSTALL = 'preinstall',
	POSTINSTALL = 'postinstall',
	PACKED = 'packed'
}

export interface Options {
	/**
	 * Source to pack (root is cwd)
	 */
	source: string;
	/**
	 * Target for the packed app (root is cwd)
	 */
	target: string;
	/**
	 * Monorepository type, at the moment only lerna support.
	 * Default: auto-detected
	 */
	type?: 'lerna' | 'nx';
	/**
	 * Enable or disable the cache, default is true (enabled)
	 */
	cache?: boolean;
	/**
	 * Working directory, can be changed, default: process.cwd()
	 */
	cwd?: string;
	/**
	 * Expressions to match package names which are internally defined
	 */
	internals: string[];
	/**
	 * Optional copy settings, defaults to `['**']`
	 */
	copy?: string[];
	/**
	 * Define opt-in hooks for certain steps
	 */
	hooks?: {
		[phase in HookPhase]?: TaperFunction[];
	};
}

export interface Analytics {
	dependencies: {
		internal: LernaPackageList;
		external: DependenciesLike;
		peer: DependenciesLike;
	};
	graph?: {
		[packageName: string]: Analytics['graph'] | Record<string, string>;
	};
}
