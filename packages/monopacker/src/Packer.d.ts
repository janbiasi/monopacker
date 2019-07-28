import { IPackerOptions, HookPhase, IAnalytics } from './types';
import { Taper } from './Taper';
export declare const DEFAULT_PACKED_PATH = "packed";
export declare class Packer {
    private options;
    static version: string;
    private taper;
    private adapter;
    private packageCache;
    private analyticsCache;
    private packedPackageCache;
    private originalCwd;
    constructor(options: IPackerOptions);
    /**
     * Returns the hooks object safely
     */
    private readonly hooks;
    /**
     * Returns the current working directory
     */
    private readonly cwd;
    /**
     * Read the contents of a package.json file,
     * pass the path for reading the file (async).
     * @param {string} packagePath
     */
    private fetchPackage;
    /**
     * Fetches the source package via `fetchPackage`
     */
    private fetchSourcePackage;
    /**
     * Create an internally, npm packable, mono package.
     * This is used for internal dependencies of the main packable entry point.
     */
    private createPackableInternal;
    /**
     * Subscribe to packer taper instance
     * @param {Taper<HookPhase, THooks>}
     * @typeparam THooks defines hook type
     */
    subscribe<THooks extends IPackerOptions['hooks']>(taper: Taper<HookPhase, Required<THooks>>): void;
    /**
     * Resolves a path in the defined cwd (options) if not absolute.
     * @param {string} partial
     */
    resolvePath(partial: string): string;
    /**
     * Validates the current environment
     */
    validate(): Promise<boolean>;
    /**
     * Removes and/or re-creates the target folder including the .monopacker meta folder
     */
    prepare(): Promise<void>;
    /**
     * Resets the packer instance and environment
     */
    teardown(): void;
    /**
     * Aggregates the needed bundle graph for packing the source application.
     * Might be delivered from cache when running parallel processes, can be disabled
     * in the options.
     */
    analyze(dryRun?: boolean): Promise<IAnalytics>;
    /**
     * Main pack method which aggregates analytics, builds artificial package file,
     * copies local submodules and all the other magic.
     */
    pack(): Promise<void>;
    createPostinstaller(packagTarballPaths: string[]): Promise<void>;
}
