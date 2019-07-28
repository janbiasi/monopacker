import { IPackerOptions } from '../types';
/**
 * Creates debugging hooks which will log the progress and possible issues.
 * @param {Pick<IPackerOptions, 'target' | 'cwd' | 'source'>} opts
 */
export declare function useDebugHooks(opts: Pick<IPackerOptions, 'target' | 'cwd' | 'source'>): IPackerOptions['hooks'];
