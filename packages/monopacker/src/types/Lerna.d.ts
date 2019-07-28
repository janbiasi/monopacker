export interface ILernaConfig {
    command?: {
        [command: string]: object;
    };
    version?: string;
    packages: string[];
}
export interface ILernaPackageListEntry {
    name: string;
    description?: string;
    version: string;
    private: boolean;
    location: string;
}
export declare type LernaPackageList = ILernaPackageListEntry[];
