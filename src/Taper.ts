import { Packer } from './Packer';
import { asyncForEach } from './utils';

export type TaperFunction<TArg> = (packer: Packer, arg: TArg) => Promise<any>;

export type TaperReceiver = (point: string, arg: any) => any;

export type InferredTaperFeedback<T> = T extends TaperFunction<infer F> ? F : any;

export class Taper<K extends string, T extends Record<K, TaperFunction<unknown>[]>> {
	private forwarder: TaperReceiver[] = [];
	private connected: Taper<K, T>[] = [];

	constructor(private packer: Packer, private factory: Partial<T>) {}

	public on<TFeedback extends any = undefined>(point: K, taperFn: TaperFunction<TFeedback>) {
		if (!this.factory[point]) {
			this.factory[point] = ([] as any) as T[K];
		}

		(this.factory[point] as TaperFunction<any>[]).push(taperFn);
	}

	public receive(receivers: TaperReceiver | TaperReceiver[]) {
		if (Array.isArray(receivers)) {
			this.forwarder.concat(receivers);
		} else {
			this.forwarder.push(receivers);
		}
	}

	public stream(taper: Taper<K, T>) {
		this.connected.push(taper);
	}

	public async tap(point: K, arg?: InferredTaperFeedback<T[K]>) {
		if (this.forwarder.length > 0) {
			await asyncForEach(this.forwarder, forwarder => forwarder(point, arg));
		}

		if (this.connected.length > 0) {
			await asyncForEach(this.connected, connected => connected.tap(point, arg));
		}

		if (!this.factory[point] || (this.factory[point] as T[K]).length === 0) {
			Promise.resolve();
		}

		await asyncForEach(this.factory[point] as T[K], async taper => await taper(this.packer, arg));
	}
}
