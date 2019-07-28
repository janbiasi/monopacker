"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var Adapter_1 = require("./Adapter");
var utils_1 = require("../utils");
var AdapterLerna = /** @class */ (function (_super) {
    __extends(AdapterLerna, _super);
    function AdapterLerna() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.packageCache = new Map();
        _this.lernaPackagesCache = new Map();
        return _this;
    }
    /**
     * Fetch required meta information for processing
     */
    AdapterLerna.prototype.getLernaPackagesInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var packages, names;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getLernaPackages()];
                    case 1:
                        packages = _a.sent();
                        names = packages.map(function (pkg) { return pkg.name; });
                        return [2 /*return*/, { packages: packages, names: names }];
                }
            });
        });
    };
    /**
     * Read the contents of a package.json file,
     * pass the path for reading the file (async).
     * @param {string} packagePath
     */
    AdapterLerna.prototype.fetchPackage = function (packagePath) {
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
     * Fetch the main package of the packable entry
     */
    AdapterLerna.prototype.fetchSourcePackage = function () {
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
                        throw new Error('Could not fetch source package');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Detect possible circular dependencies which will lead to an error in
     * the pack and/or analyze step.
     */
    AdapterLerna.prototype.findCircularDependencies = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, names, packages, lernaPkgDefs, circularGraph;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getLernaPackagesInfo()];
                    case 1:
                        _a = _b.sent(), names = _a.names, packages = _a.packages;
                        return [4 /*yield*/, Promise.all(packages.map(function (pkg) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.fetchPackage(path_1.resolve(pkg.location, 'package.json'))];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 2:
                        lernaPkgDefs = _b.sent();
                        circularGraph = lernaPkgDefs.reduce(function (prev, curr) {
                            var _a;
                            return (__assign({}, prev, (_a = {}, _a[curr.name] = Object.keys(utils_1.extractDependencies(curr.dependencies, function (dep) { return names.indexOf(dep) > -1; })), _a)));
                        }, {});
                        Object.keys(circularGraph).forEach(function (packageEntry) {
                            var internalDeps = circularGraph[packageEntry];
                            internalDeps.forEach(function (internalLinkedDependency) {
                                if (circularGraph[internalLinkedDependency]) {
                                    if (circularGraph[internalLinkedDependency].indexOf(packageEntry) > -1) {
                                        throw new Error(packageEntry + " relies on " + internalLinkedDependency + " and vice versa, please fix this circular dependency");
                                    }
                                }
                            });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Recursive aggregation of internal dependencies
     */
    AdapterLerna.prototype.resolveDependantInternals = function (graph, sourcePackage, lernaPackageInfo) {
        if (graph === void 0) { graph = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var productionDependencies, internalPackageNames, requiredInternalDeps, internalDependencyNames, internalDependencies, recuriveModules, recursiveInternals, recursiveExternals, resolved;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        productionDependencies = utils_1.extractDependencies(sourcePackage.dependencies, function (dependency) {
                            return lernaPackageInfo.names.indexOf(dependency) === -1;
                        });
                        internalPackageNames = lernaPackageInfo.packages.map(function (pkg) { return pkg.name; });
                        requiredInternalDeps = utils_1.extractDependencies(sourcePackage.dependencies, function (dependency) {
                            return internalPackageNames.indexOf(dependency) > -1 && dependency !== sourcePackage.name;
                        });
                        internalDependencyNames = Object.keys(requiredInternalDeps);
                        internalDependencies = lernaPackageInfo.packages.filter(function (_a) {
                            var name = _a.name;
                            if (name === sourcePackage.name) {
                                // skip self
                                return false;
                            }
                            // skip unneeded
                            return internalDependencyNames.indexOf(name) > -1;
                        });
                        return [4 /*yield*/, Promise.all(internalDependencies.map(function (entry) { return __awaiter(_this, void 0, void 0, function () {
                                var childModulePkg;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.fetchPackage(path_1.resolve(entry.location, 'package.json'))];
                                        case 1:
                                            childModulePkg = _a.sent();
                                            return [4 /*yield*/, this.resolveDependantInternals(graph, childModulePkg, lernaPackageInfo)];
                                        case 2: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); }))];
                    case 1:
                        recuriveModules = _a.sent();
                        recursiveInternals = recuriveModules.reduce(function (prev, curr) { return prev.concat(curr.internal); }, []);
                        recursiveExternals = recuriveModules.reduce(function (prev, curr) { return (__assign({}, prev, curr.external)); }, {});
                        resolved = {
                            internal: internalDependencies.concat(recursiveInternals),
                            external: __assign({}, productionDependencies, recursiveExternals)
                        };
                        // build related graph from recursive modules
                        graph[sourcePackage.name] = {
                            internal: resolved.internal.reduce(function (prev, _a) {
                                var _b;
                                var name = _a.name, version = _a.version;
                                return (__assign({}, prev, (_b = {}, _b[name] = version, _b)));
                            }, {}),
                            external: recursiveExternals
                        };
                        return [2 /*return*/, __assign({}, resolved, { graph: graph })];
                }
            });
        });
    };
    /**
     * Fetch all lerna packages from the defined cwd
     */
    AdapterLerna.prototype.getLernaPackages = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.lernaPackagesCache.has(this.cwd)) {
                            return [2 /*return*/, this.lernaPackagesCache.get(this.cwd)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, utils_1.getLernaPackages(this.cwd)];
                    case 2:
                        res = _a.sent();
                        this.lernaPackagesCache.set(this.cwd, res);
                        return [2 /*return*/, res];
                    case 3:
                        err_3 = _a.sent();
                        throw new Error("Failed to fetch lerna packages: " + err_3.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pre-validation process
     */
    AdapterLerna.prototype.validate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var names, duplicates, err_4, err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getLernaPackagesInfo()];
                    case 1:
                        names = (_a.sent()).names;
                        duplicates = utils_1.findDuplicatesInArray(names);
                        if (duplicates.length > 0) {
                            return [2 /*return*/, {
                                    valid: false,
                                    message: "Duplicate package names found: " + duplicates.join(', ')
                                }];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        err_4 = _a.sent();
                        return [2 /*return*/, {
                                valid: false,
                                message: "" + err_4
                            }];
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.findCircularDependencies()];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_5 = _a.sent();
                        return [2 /*return*/, {
                                valid: false,
                                message: "" + err_5
                            }];
                    case 6: 
                    // everything's fine
                    return [2 /*return*/, { valid: true }];
                }
            });
        });
    };
    /**
     * Main analytics process
     */
    AdapterLerna.prototype.analyze = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, valid, message, peer_1, rootGraph, sourcePkg_1, _b, packages, names_1, requiredDirectProductionDeps, _c, internal /*, external*/, graph_1, result, err_6;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.validate()];
                    case 1:
                        _a = _d.sent(), valid = _a.valid, message = _a.message;
                        if (!valid) {
                            throw new Error(message || "Invalid configuration found, check the docs for correct usage");
                        }
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 7, , 8]);
                        peer_1 = {};
                        rootGraph = {};
                        return [4 /*yield*/, this.fetchSourcePackage()];
                    case 3:
                        sourcePkg_1 = _d.sent();
                        return [4 /*yield*/, this.getLernaPackagesInfo()];
                    case 4:
                        _b = _d.sent(), packages = _b.packages, names_1 = _b.names;
                        requiredDirectProductionDeps = utils_1.extractDependencies(sourcePkg_1.dependencies, function (dependency) {
                            return names_1.indexOf(dependency) === -1;
                        });
                        return [4 /*yield*/, this.resolveDependantInternals(rootGraph, sourcePkg_1, {
                                packages: packages,
                                names: names_1
                            })];
                    case 5:
                        _c = _d.sent(), internal = _c.internal, graph_1 = _c.graph;
                        // aggregating and building graph for sub-modules
                        return [4 /*yield*/, utils_1.asyncForEach(internal, function (_a) {
                                var location = _a.location;
                                return __awaiter(_this, void 0, void 0, function () {
                                    var subPkg, installablePeers;
                                    var _b;
                                    return __generator(this, function (_c) {
                                        switch (_c.label) {
                                            case 0: return [4 /*yield*/, this.fetchPackage(location + "/package.json")];
                                            case 1:
                                                subPkg = _c.sent();
                                                installablePeers = utils_1.extractDependencies(subPkg.dependencies, function (dependency) {
                                                    if (dependency === sourcePkg_1.name) {
                                                        // skip self
                                                        return false;
                                                    }
                                                    // skip internals atm.
                                                    return names_1.indexOf(dependency) === -1;
                                                });
                                                // building graph and peers
                                                Object.assign(graph_1, (_b = {},
                                                    _b[subPkg.name] = installablePeers,
                                                    _b));
                                                Object.assign(peer_1, installablePeers);
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            })];
                    case 6:
                        // aggregating and building graph for sub-modules
                        _d.sent();
                        result = {
                            dependencies: {
                                external: requiredDirectProductionDeps,
                                internal: internal,
                                peer: peer_1
                            },
                            graph: rootGraph
                        };
                        return [2 /*return*/, result];
                    case 7:
                        err_6 = _d.sent();
                        throw new Error("" + (err_6 || 'Analyzing failed'));
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return AdapterLerna;
}(Adapter_1.Adapter));
exports.AdapterLerna = AdapterLerna;
//# sourceMappingURL=Lerna.js.map