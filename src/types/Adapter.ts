import { IAnalytics, IPackerOptions } from './Runtime';

export interface IAdapter {
	analyze(): Promise<IAnalytics>;
}

export interface IAdapterConstructable {
	new (cwd: string, options: IPackerOptions): IAdapter;
}
