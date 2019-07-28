import { resolve, join } from 'path';
import { IAnalytics, IPackerOptions } from '../src/types';
import { Packer } from '../src/Packer';

export const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time));

/**
 * Creates an object for snapshot testing out of monopacker analytics data
 * @param {IAnalytics} analytics
 */
export const analyticsToSnapshot = (analytics: IAnalytics) => {
	return {
		...analytics,
		dependencies: {
			...analytics.dependencies,
			internal: analytics.dependencies.internal.map(entry => ({
				name: entry.name,
				version: entry.version,
				description: entry.description,
				private: entry.private
			}))
		}
	};
};

/**
 * Create a new Packer instance for cwd/source/hooks in a simple way
 */
export const createTestPackerFor = (
	cwd: string,
	source: string,
	hooks?: Packer['hooks'],
	opts: Pick<IPackerOptions, 'createInstaller'> = {}
) =>
	new Packer({
		cwd,
		source,
		target: resolve(cwd, 'temp'),
		hooks,
		createInstaller: opts.createInstaller || false
	});

export const createResolverWithin = (basePath: string) => (...subPaths: string[]) => resolve(basePath, ...subPaths);
