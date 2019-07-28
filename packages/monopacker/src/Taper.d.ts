import { Packer } from './Packer';
export declare type TaperFunction<TArg> = (packer: Packer, arg: TArg) => Promise<any>;
export declare type TaperReceiver = (point: string, arg: any) => any;
export declare type InferredTaperFeedback<T> = T extends TaperFunction<infer F> ? F : any;
export declare class Taper<K extends string, T extends Record<K, TaperFunction<unknown>[]>> {
    private packer;
    private factory;
    private forwarder;
    private connected;
    constructor(packer: Packer, factory: Partial<T>);
    on<TFeedback extends any = undefined>(point: K, taperFn: TaperFunction<TFeedback>): void;
    receive(receivers: TaperReceiver | TaperReceiver[]): void;
    stream(taper: Taper<K, T>): void;
    tap(point: K, arg?: InferredTaperFeedback<T[K]>): Promise<void>;
}
