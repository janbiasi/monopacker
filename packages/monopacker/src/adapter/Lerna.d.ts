import { Adapter } from './Adapter';
import { IAnalytics, LernaPackageList } from '../types';
export declare class AdapterLerna extends Adapter {
    private packageCache;
    private lernaPackagesCache;
    /**
     * Fetch required meta information for processing
     */
    private getLernaPackagesInfo;
    /**
     * Read the contents of a package.json file,
     * pass the path for reading the file (async).
     * @param {string} packagePath
     */
    private fetchPackage;
    /**
     * Fetch the main package of the packable entry
     */
    private fetchSourcePackage;
    /**
     * Detect possible circular dependencies which will lead to an error in
     * the pack and/or analyze step.
     */
    private findCircularDependencies;
    /**
     * Recursive aggregation of internal dependencies
     */
    private resolveDependantInternals;
    /**
     * Fetch all lerna packages from the defined cwd
     */
    getLernaPackages(): Promise<LernaPackageList>;
    /**
     * Pre-validation process
     */
    validate(): Promise<{
        valid: boolean;
        message: string;
    } | {
        valid: boolean;
        message?: undefined;
    }>;
    /**
     * Main analytics process
     */
    analyze(): Promise<IAnalytics>;
}
