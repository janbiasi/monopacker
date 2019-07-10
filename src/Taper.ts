import { Packer } from './Packer';
import { asyncForEach } from './utils';

export type TaperFunction = (packer: Packer, ...args: any[]) => Promise<any>;

export class Taper<K extends string, T extends Partial<Record<K, TaperFunction[]>>> {
	constructor(private packer: Packer, private factory: T) { }

	public on(point: K, taperFn: TaperFunction) {
		if (!this.factory[point]) {
			this.factory[point] = [] as T[K];
		}

		this.factory[point].push(taperFn);
	}

	public async tap(point: K, ...args: any[]) {
		if (!this.factory[point] || this.factory[point].length === 0) {
			Promise.resolve();
		}

		await asyncForEach(this.factory[point], async taper => await taper(this.packer, ...args));
	}
}
