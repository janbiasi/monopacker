import { IAnalytics, IPackerOptions, IAdapter } from '../types';
export declare class Adapter implements IAdapter {
    protected cwd: string;
    protected options: IPackerOptions;
    constructor(cwd: string, options: IPackerOptions);
    validate(): Promise<{
        valid: boolean;
    }>;
    analyze(): Promise<IAnalytics>;
}
