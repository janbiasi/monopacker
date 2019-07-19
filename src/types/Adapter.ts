import { IAnalytics, IPackerOptions } from './Runtime';

export interface IAdapter {
	analyze(): Promise<IAnalytics>;
	validate(): Promise<{
		valid: boolean;
		message?: string;
	}>;
}

export interface IAdapterConstructable {
	new (cwd: string, options: IPackerOptions): IAdapter;
}
