"use strict";
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
var ora_1 = require("ora");
var path_1 = require("path");
var Packer_1 = require("../../Packer");
var utils_1 = require("../../utils");
var CWD = process.cwd();
function pack(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var spinner, installTimer, packer, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    spinner = ora_1.default('Creating packer instance');
                    spinner.frame();
                    spinner.start();
                    packer = new Packer_1.Packer({
                        cwd: opts.cwd,
                        source: opts.source,
                        target: opts.target,
                        copy: opts.copy,
                        cache: opts.cache,
                        hooks: {
                            init: [
                                function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        spinner.succeed("Initialized packer v" + Packer_1.Packer.version + " for " + utils_1.displayPath(opts.cwd || CWD, opts.source));
                                        if (opts.cwd) {
                                            spinner.info("Using custom root directory ~" + path_1.relative(CWD, opts.cwd));
                                        }
                                        spinner.info("Setting packing output to " + (opts.target || Packer_1.DEFAULT_PACKED_PATH + " (default)"));
                                        return [2 /*return*/];
                                    });
                                }); }
                            ],
                            preanalyze: [
                                function () { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        spinner.text = 'Fetching analytics data from package ...';
                                        return [2 /*return*/];
                                    });
                                }); }
                            ],
                            postanalyze: [
                                function (_packer, _a) {
                                    var analytics = _a.analytics, fromCache = _a.fromCache, generateAnalyticsFile = _a.generateAnalyticsFile;
                                    return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_b) {
                                            if (fromCache) {
                                                spinner.succeed('Analytics served from cache');
                                            }
                                            else {
                                                spinner.succeed('Analytics successfully written to <target>/monopacker.analytics.json');
                                            }
                                            if (!generateAnalyticsFile) {
                                                spinner.info('Skip writing analytics file to output');
                                            }
                                            spinner.succeed("Found " + utils_1.countMsg(analytics.dependencies.external, 'external package') + " to install via NPM");
                                            spinner.succeed("Found " + utils_1.countMsg(analytics.dependencies.internal, 'internal package') + " to copy");
                                            spinner.succeed("Found " + utils_1.countMsg(analytics.dependencies.peer, 'aggregated peer package') + " to include in production");
                                            return [2 /*return*/];
                                        });
                                    });
                                }
                            ],
                            preinstall: [
                                function (_packer, _a) {
                                    var name = _a.name, dependencies = _a.dependencies;
                                    return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_b) {
                                            spinner = spinner.start("Installing " + utils_1.countMsg(dependencies, 'package') + " in " + name + " ...");
                                            installTimer = process.hrtime();
                                            return [2 /*return*/];
                                        });
                                    });
                                }
                            ],
                            postinstall: [
                                function (_packer, _a) {
                                    var dependencies = _a.dependencies;
                                    return __awaiter(_this, void 0, void 0, function () {
                                        var installationTimeInSeconds;
                                        return __generator(this, function (_b) {
                                            installationTimeInSeconds = process.hrtime(installTimer)[0];
                                            spinner.succeed("Production packages have been installed (" + utils_1.countMsg(dependencies, 'package') + " in ~" + installationTimeInSeconds + "s)");
                                            return [2 /*return*/];
                                        });
                                    });
                                }
                            ],
                            prelink: [
                                function (_packer, entries) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        spinner.text = "Found " + utils_1.countMsg(entries, 'entry', 'entries') + " to copy";
                                        return [2 /*return*/];
                                    });
                                }); }
                            ],
                            postlink: [
                                function (_packer, entries) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        spinner.succeed("Linked " + utils_1.countMsg(entries, 'monorepository package') + " successfully");
                                        return [2 /*return*/];
                                    });
                                }); }
                            ],
                            packed: [
                                function (_packer, _a) {
                                    var artificalPackage = _a.artificalPackage;
                                    return __awaiter(_this, void 0, void 0, function () {
                                        return __generator(this, function (_b) {
                                            spinner.info("Packed hash is " + artificalPackage.monopacker.hash);
                                            spinner.succeed("Application " + artificalPackage.name + " packed successfully!");
                                            return [2 /*return*/];
                                        });
                                    });
                                }
                            ]
                        }
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, packer.pack()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_1 = _a.sent();
                    spinner.fail("" + err_1);
                    process.exit(1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.pack = pack;
//# sourceMappingURL=pack.js.map