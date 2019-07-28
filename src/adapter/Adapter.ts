import { IAnalytics, IPackerOptions, IAdapter } from '../types';

export class Adapter implements IAdapter {
	constructor(protected cwd: string, protected options: IPackerOptions) {}

	public async validate() {
		return { valid: true };
	}

	public async analyze(): Promise<IAnalytics> {
		throw new Error('Not implemented');
	}
}
