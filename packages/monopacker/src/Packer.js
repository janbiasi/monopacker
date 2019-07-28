"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var debug_1 = require("debug");
var types_1 = require("./types");
var utils_1 = require("./utils");
var Taper_1 = require("./Taper");
var adapter_1 = require("./adapter");
var debug_hooks_1 = require("./helper/debug-hooks");
var const_1 = require("./const");
var neededCopySettings = ['**', '!node_modules', '!package.json'];
var defaultCopySettings = neededCopySettings.concat([
    '!.editorconfig',
    '!.gitignore',
    '!.nvmrc',
    '!.node-version',
    '!.npmrc',
    '!**.md',
    '!tsconfig*.json'
]);
exports.DEFAULT_PACKED_PATH = 'packed';
var Packer = /** @class */ (function () {
    function Packer(options) {
        this.options = options;
        // caching maps for better performance
        this.packageCache = new Map();
        this.analyticsCache = new WeakMap();
        this.packedPackageCache = new WeakMap();
        // backups
        this.originalCwd = process.cwd();
        // create taper for packer
        this.taper = new Taper_1.Taper(this, this.hooks);
        // use provided or set default adapter, TODO: auto-detect
        this.adapter = options.adapter
            ? new options.adapter(this.cwd, this.options)
            : new adapter_1.AdapterLerna(this.cwd, this.options);
        // set cache by default to true
        options.cache = options.cache === false ? false : true;
        // verify correct paths from cwd setting
        options.source = this.resolvePath(options.source);
        options.target = this.resolvePath(options.target || exports.DEFAULT_PACKED_PATH);
        // verify copy options
        options.copy = options.copy ? neededCopySettings.concat(options.copy) : defaultCopySettings;
        // enable debugging if needed
        if (options.debug) {
            debug_1.default.enable('packer');
            this.taper.stream(new Taper_1.Taper(this, debug_hooks_1.useDebugHooks(options)));
        }
        // set current working directory to cwd
        try {
            process.chdir(path_1.isAbsolute(this.cwd) ? this.cwd : path_1.resolve(process.cwd()));
        }
        catch (err) {
            throw new Error("Couldn't change to provided cwd (maybe not found): " + err.message);
        }
        // tape initialization
        this.taper.tap(types_1.HookPhase.INIT);
    }
    Object.defineProperty(Packer.prototype, "hooks", {
        /**
         * Returns the hooks object safely
         */
        get: function () {
            return this.options.hooks || {};
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Packer.prototype, "cwd", {
        /**
         * Returns the current working directory
         */
        get: function () {
            return this.options.cwd || process.cwd();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Read the contents of a package.json file,
     * pass the path for reading the file (async).
     * @param {string} packagePath
     */
    Packer.prototype.fetchPackage = function (packagePath) {
        return __awaiter(this, void 0, void 0, function () {
            var rawPackageInfo, packageInfo, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.packageCache.has(packagePath)) {
                            return [2 /*return*/, Promise.resolve(this.packageCache.get(packagePath))];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, utils_1.fs.readFile(packagePath)];
                    case 2:
                        rawPackageInfo = _a.sent();
                        packageInfo = JSON.parse((rawPackageInfo || '{}').toString());
                        this.packageCache.set(packagePath, packageInfo);
                        return [2 /*return*/, packageInfo];
                    case 3:
                        err_1 = _a.sent();
                        this.packageCache.delete(packagePath);
                        throw new Error(err_1.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches the source package via `fetchPackage`
     */
    Packer.prototype.fetchSourcePackage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sourcePkgPath, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sourcePkgPath = path_1.join(this.options.source, 'package.json');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.fetchPackage(sourcePkgPath)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        err_2 = _a.sent();
                        throw new Error(err_2.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create an internally, npm packable, mono package.
     * This is used for internal dependencies of the main packable entry point.
     */
    Packer.prototype.createPackableInternal = function (source, dest) {
        return __awaiter(this, void 0, void 0, function () {
            var packageDef;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.fs.mkdirp(dest)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.fetchPackage(path_1.resolve(source, 'package.json'))];
                    case 2:
                        packageDef = _a.sent();
                        return [4 /*yield*/, utils_1.copyDir(source, dest, {
                                dereference: true,
                                filter: function (filename) {
                                    if (filename.indexOf('node_modules') > -1) {
                                        return false;
                                    }
                                    return true;
                                }
                            })];
                    case 3:
                        _a.sent();
                        packageDef.dependencies = {};
                        packageDef.devDependencies = {};
                        return [4 /*yield*/, utils_1.fs.writeFile(path_1.resolve(dest, 'package.json'), JSON.stringify(packageDef, null, 2))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscribe to packer taper instance
     * @param {Taper<HookPhase, THooks>}
     * @typeparam THooks defines hook type
     */
    Packer.prototype.subscribe = function (taper) {
        this.taper.stream(taper);
    };
    /**
     * Resolves a path in the defined cwd (options) if not absolute.
     * @param {string} partial
     */
    Packer.prototype.resolvePath = function (partial) {
        if (path_1.isAbsolute(partial)) {
            return partial;
        }
        return path_1.resolve(this.cwd, partial);
    };
    /**
     * Validates the current environment
     */
    Packer.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sourceExists, sourcePkgExists, sourcesExists, adapterValidationResult, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, utils_1.fs.pathExists(this.options.source)];
                    case 1:
                        sourceExists = _a.sent();
                        return [4 /*yield*/, utils_1.fs.pathExists(path_1.resolve(this.options.source, 'package.json'))];
                    case 2:
                        sourcePkgExists = _a.sent();
                        sourcesExists = sourceExists && sourcePkgExists;
                        if (!sourcesExists) {
                            throw "Missing sources, please check if " + this.options.source + " and " + this.options.source + "/package.json exists";
                        }
                        return [4 /*yield*/, this.adapter.validate()];
                    case 3:
                        adapterValidationResult = _a.sent();
                        if (sourcesExists && adapterValidationResult.valid) {
                            return [2 /*return*/, true];
                        }
                        throw adapterValidationResult.message || 'Invalid packer configuration';
                    case 4:
                        err_3 = _a.sent();
                        throw err_3 || 'Invalid packer configuration';
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes and/or re-creates the target folder including the .monopacker meta folder
     */
    Packer.prototype.prepare = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, utils_1.rimraf(this.options.target)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, utils_1.fs.mkdirp(path_1.resolve(this.options.target, const_1.Folders.MONOPACKER))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Resets the packer instance and environment
     */
    Packer.prototype.teardown = function () {
        debug_1.default.disable();
        process.chdir(this.originalCwd);
    };
    /**
     * Aggregates the needed bundle graph for packing the source application.
     * Might be delivered from cache when running parallel processes, can be disabled
     * in the options.
     */
    Packer.prototype.analyze = function (dryRun) {
        if (dryRun === void 0) { dryRun = false; }
        return __awaiter(this, void 0, void 0, function () {
            var everythingsAllright, analytics, err_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validate()];
                    case 1:
                        everythingsAllright = _a.sent();
                        if (!everythingsAllright) {
                            throw new Error("Invalid options provided, check if all paths exists");
                        }
                        if (this.analyticsCache.has(this.options)) {
                            return [2 /*return*/, this.analyticsCache.get(this.options)];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 11]);
                        return [4 /*yield*/, this.taper.tap(types_1.HookPhase.PREANALYZE)];
                    case 3:
                        _a.sent();
                        if (!(dryRun === false)) return [3 /*break*/, 5];
                        // setup target structure
                        return [4 /*yield*/, this.prepare()];
                    case 4:
                        // setup target structure
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.adapter.analyze()];
                    case 6:
                        analytics = _a.sent();
                        // set integrity hash for checks
                        analytics.integrity = utils_1.createIntegrityHash(Packer.version, analytics);
                        // rewrite internal dependency paths to non-absolute
                        analytics.dependencies.internal = analytics.dependencies.internal.map(function (internalDep) { return (__assign({}, internalDep, { location: internalDep.location.replace(_this.options.cwd, '.') })); });
                        // tap and write analytics
                        return [4 /*yield*/, this.taper.tap(types_1.HookPhase.POSTANALYZE, {
                                analytics: analytics,
                                dryRun: dryRun,
                                fromCache: false
                            })];
                    case 7:
                        // tap and write analytics
                        _a.sent();
                        if (!(dryRun === false)) return [3 /*break*/, 9];
                        return [4 /*yield*/, utils_1.fs.writeFile(path_1.resolve(this.options.target, const_1.Folders.MONOPACKER, const_1.Files.ANALYTICS), JSON.stringify(analytics, null, 2))];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [2 /*return*/, analytics];
                    case 10:
                        err_4 = _a.sent();
                        throw new Error("Failed to aggregate analytics: " + err_4.message);
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Main pack method which aggregates analytics, builds artificial package file,
     * copies local submodules and all the other magic.
     */
    Packer.prototype.pack = function () {
        return __awaiter(this, void 0, void 0, function () {
            var analytics, sourcePkg, artificalPackageInfo, copiedFiles_1, nativeNpmPackedArchiveList_1, monopackerArchiveList_1, err_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 13, , 14]);
                        return [4 /*yield*/, this.analyze()];
                    case 1:
                        analytics = _a.sent();
                        return [4 /*yield*/, this.fetchSourcePackage()];
                    case 2:
                        sourcePkg = _a.sent();
                        artificalPackageInfo = this.packedPackageCache.get(this) || {
                            name: sourcePkg.name + "-packed",
                            version: sourcePkg.version || '0.0.0',
                            description: sourcePkg.description || '',
                            scripts: {
                                postinstall: 'echo "No monopacker packages to install"'
                            },
                            monopacker: {
                                // push hash for integrity checks
                                hash: analytics.integrity,
                                // reference packer version
                                version: Packer.version,
                                // common NPM tree out of lerna packages
                                linked: analytics.dependencies.internal.reduce(function (prev, _a) {
                                    var _b;
                                    var name = _a.name, version = _a.version;
                                    return (__assign({}, prev, (_b = {}, _b[name] = version, _b)));
                                }, {})
                            },
                            dependencies: __assign({}, analytics.dependencies.external, analytics.dependencies.peer // dependencies of submodules
                            )
                        };
                        // enable caching of aggregated data for packing process
                        if (!this.packedPackageCache.has(this)) {
                            this.packedPackageCache.set(this, artificalPackageInfo);
                        }
                        // copy all source files by options
                        return [4 /*yield*/, this.taper.tap(types_1.HookPhase.PRECOPY)];
                    case 3:
                        // copy all source files by options
                        _a.sent();
                        copiedFiles_1 = [];
                        return [4 /*yield*/, utils_1.copyDir(this.options.source, this.options.target, {
                                dereference: true,
                                filter: function (fileName) {
                                    var doesMatchCriteria = _this.options.copy
                                        .map(function (filter) { return utils_1.matcher.isMatch(fileName, filter); })
                                        .every(function (v) { return v === true; });
                                    if (doesMatchCriteria) {
                                        copiedFiles_1.push(fileName);
                                    }
                                    return doesMatchCriteria;
                                }
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.taper.tap(types_1.HookPhase.POSTCOPY, copiedFiles_1)];
                    case 5:
                        _a.sent();
                        nativeNpmPackedArchiveList_1 = [];
                        monopackerArchiveList_1 = [];
                        return [4 /*yield*/, utils_1.asyncForEach(analytics.dependencies.internal, function (lernaPkg) { return __awaiter(_this, void 0, void 0, function () {
                                var tempPackedPath, tarBundleName;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            tempPackedPath = path_1.resolve(this.options.target, const_1.Folders.MONOPACKER, const_1.Folders.INTERNAL, lernaPkg.name.replace('/', '-').replace('@', ''));
                                            return [4 /*yield*/, this.createPackableInternal(lernaPkg.location, tempPackedPath)];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, utils_1.execa('npm', ['pack', tempPackedPath])];
                                        case 2:
                                            tarBundleName = _a.sent();
                                            return [4 /*yield*/, utils_1.rimraf(tempPackedPath)];
                                        case 3:
                                            _a.sent();
                                            nativeNpmPackedArchiveList_1.push(tarBundleName.stdout);
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, utils_1.asyncForEach(nativeNpmPackedArchiveList_1, function (packedArchiveName) { return __awaiter(_this, void 0, void 0, function () {
                                var tarArchivePath, targetTarArchivePath;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            tarArchivePath = path_1.resolve(this.options.cwd, packedArchiveName);
                                            targetTarArchivePath = path_1.resolve(this.options.target, const_1.Folders.MONOPACKER, packedArchiveName);
                                            // add relative path from target to the archive list
                                            monopackerArchiveList_1.push(targetTarArchivePath.replace(this.options.target, '.'));
                                            // copy tarball to .monopacker directory
                                            return [4 /*yield*/, utils_1.fs.move(tarArchivePath, targetTarArchivePath)];
                                        case 1:
                                            // copy tarball to .monopacker directory
                                            _a.sent();
                                            // remove old tarball in root directory (npm default, can't be overwritten :( ...)
                                            return [4 /*yield*/, utils_1.fs.remove(tarArchivePath)];
                                        case 2:
                                            // remove old tarball in root directory (npm default, can't be overwritten :( ...)
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 7:
                        _a.sent();
                        // write package definitions to a registry file
                        return [4 /*yield*/, utils_1.fs.writeFile(path_1.resolve(this.options.target, const_1.Folders.MONOPACKER, const_1.Files.REGISTRY), JSON.stringify(monopackerArchiveList_1.map(function (archivePath) { return archivePath.replace(_this.options.target, '.'); }), null, 2))];
                    case 8:
                        // write package definitions to a registry file
                        _a.sent();
                        return [4 /*yield*/, this.taper.tap(types_1.HookPhase.POSTLINK, analytics.dependencies.internal)];
                    case 9:
                        _a.sent();
                        // create postinstall script for package tarballs
                        if (monopackerArchiveList_1) {
                            artificalPackageInfo.scripts = artificalPackageInfo.scripts || {};
                            artificalPackageInfo.scripts.postinstall = "npm i --no-scripts " + monopackerArchiveList_1.join(' ');
                        }
                        // create artificial target package.json
                        return [4 /*yield*/, utils_1.fs.writeFile(path_1.join(this.options.target, 'package.json'), JSON.stringify(artificalPackageInfo, null, 2))];
                    case 10:
                        // create artificial target package.json
                        _a.sent();
                        // finalize
                        return [4 /*yield*/, this.teardown()];
                    case 11:
                        // finalize
                        _a.sent();
                        return [4 /*yield*/, this.taper.tap(types_1.HookPhase.PACKED, {
                                analytics: analytics,
                                copiedFiles: copiedFiles_1,
                                artificalPackage: artificalPackageInfo
                            })];
                    case 12:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        err_5 = _a.sent();
                        // simply show any child error on failure
                        throw err_5;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    Packer.prototype.createPostinstaller = function (packagTarballPaths) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    Packer.version = '1';
    return Packer;
}());
exports.Packer = Packer;
//# sourceMappingURL=Packer.js.map