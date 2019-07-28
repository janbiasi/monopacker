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
var debug = require("debug");
var types_1 = require("../types");
var Packer_1 = require("../Packer");
var utils_1 = require("../utils");
var CWD = process.cwd();
var log = debug('packer');
/**
 * Creates debugging hooks which will log the progress and possible issues.
 * @param {Pick<IPackerOptions, 'target' | 'cwd' | 'source'>} opts
 */
function useDebugHooks(opts) {
    var _a;
    var _this = this;
    return _a = {},
        _a[types_1.HookPhase.INIT] = [
            function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    log("Initialized packer v" + Packer_1.Packer.version + " for " + utils_1.displayPath(opts.cwd || CWD, opts.source));
                    log("Setting packing output to " + (opts.target || Packer_1.DEFAULT_PACKED_PATH + " (default)"));
                    return [2 /*return*/];
                });
            }); }
        ],
        _a[types_1.HookPhase.PREANALYZE] = [
            function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    log('Fetching analytics data from package ...');
                    return [2 /*return*/];
                });
            }); }
        ],
        _a[types_1.HookPhase.POSTANALYZE] = [
            function (_packer, _a) {
                var analytics = _a.analytics, fromCache = _a.fromCache, generateAnalyticsFile = _a.generateAnalyticsFile;
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        if (fromCache) {
                            log('Analytics served from cache');
                        }
                        else {
                            log('Analytics successfully written to <target>/monopacker.analytics.json');
                        }
                        if (!generateAnalyticsFile) {
                            log('Skip writing analytics file to output');
                        }
                        log("Found " + utils_1.countMsg(analytics.dependencies.external, 'external package') + " to install via NPM");
                        log("Found " + utils_1.countMsg(analytics.dependencies.internal, 'internal package') + " to copy");
                        log("Found " + utils_1.countMsg(analytics.dependencies.peer, 'aggregated peer package') + " to include in production");
                        return [2 /*return*/];
                    });
                });
            }
        ],
        _a[types_1.HookPhase.PREINSTALL] = [
            function (_packer, _a) {
                var name = _a.name, dependencies = _a.dependencies;
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        log("Installing " + utils_1.countMsg(dependencies, 'package') + " in " + name + " ...");
                        return [2 /*return*/];
                    });
                });
            }
        ],
        _a[types_1.HookPhase.POSTINSTALL] = [
            function (_packer, _a) {
                var dependencies = _a.dependencies;
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        log("Production packages have been installed (" + utils_1.countMsg(dependencies, 'package') + ")");
                        return [2 /*return*/];
                    });
                });
            }
        ],
        _a[types_1.HookPhase.PRELINK] = [
            function (_packer, entries) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    log("Found " + utils_1.countMsg(entries, 'entry', 'entries') + " to copy");
                    return [2 /*return*/];
                });
            }); }
        ],
        _a[types_1.HookPhase.POSTLINK] = [
            function (_packer, entries) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    log("Linked " + utils_1.countMsg(entries, 'monorepository package') + " successfully");
                    return [2 /*return*/];
                });
            }); }
        ],
        _a[types_1.HookPhase.PACKED] = [
            function (_packer, _a) {
                var artificalPackage = _a.artificalPackage;
                return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_b) {
                        log("Packed hash is " + artificalPackage.monopacker.hash);
                        log("Application " + artificalPackage.name + " packed successfully!");
                        return [2 /*return*/];
                    });
                });
            }
        ],
        _a;
}
exports.useDebugHooks = useDebugHooks;
//# sourceMappingURL=debug-hooks.js.map