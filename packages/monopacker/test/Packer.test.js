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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var Packer_1 = require("../src/Packer");
var utils_1 = require("../src/utils");
var types_1 = require("../src/types");
// hack to not provide this as option.cwd in packer ctor
var BASIC_CWD = path_1.resolve(__dirname, 'fixtures/basic');
var CYCLICAL_CWD = path_1.resolve(__dirname, 'fixtures/circular');
var MULTITREE_CWD = path_1.resolve(__dirname, 'fixtures/multitree');
var DUPLICATES_CWD = path_1.resolve(__dirname, 'fixtures/duplicates');
var SELF_CWD = path_1.resolve(__dirname, 'fixtures/self');
var INVALID_CWD = path_1.resolve(__dirname, 'fixtures/duplicates');
var createTestPackerFor = function (cwd, source, hooks) {
    return new Packer_1.Packer({
        cwd: cwd,
        source: source,
        target: path_1.resolve(cwd, 'temp'),
        hooks: hooks
    });
};
var createTestPackerForBasic = function (hooks) { return createTestPackerFor(BASIC_CWD, 'packages/main', hooks); };
var createTestPackerForcircular = function (hooks) { return createTestPackerFor(CYCLICAL_CWD, 'packages/a', hooks); };
var createTestPackerForMultitree = function (hooks) {
    return createTestPackerFor(MULTITREE_CWD, 'packages/c', hooks);
};
var createTestPackerForDuplicates = function (hooks) {
    return createTestPackerFor(DUPLICATES_CWD, 'packages/main', hooks);
};
var createTestPackerForSelf = function (hooks) { return createTestPackerFor(SELF_CWD, 'packages/main', hooks); };
var createTestPackerToGalaxy = function (hooks) {
    return createTestPackerFor(INVALID_CWD, 'packages/does-not-exist', hooks);
};
var analyticsToSnapshot = function (analytics) {
    return __assign({}, analytics, { dependencies: __assign({}, analytics.dependencies, { internal: analytics.dependencies.internal.map(function (entry) { return ({
                name: entry.name,
                version: entry.version,
                description: entry.description,
                private: entry.private
            }); }) }) });
};
describe('Packer', function () {
    describe('Lerna', function () {
        it('should fail on not found validation', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, willFailDueNotFound, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerToGalaxy();
                        willFailDueNotFound = function () { return __awaiter(_this, void 0, void 0, function () {
                            var err_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, packer.validate()];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_2 = _a.sent();
                                        throw new Error(err_2);
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, expect(willFailDueNotFound()).rejects.toThrow()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, willFailDueNotFound()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        expect(("" + err_1).indexOf('Missing sources, please check if') > -1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        it('should aggregate any analytics', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, analytics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerForBasic();
                        return [4 /*yield*/, packer.analyze()];
                    case 1:
                        analytics = _a.sent();
                        expect(analytics).toBeDefined();
                        expect(analyticsToSnapshot(analytics)).toMatchSnapshot();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should generate a monopacker.analytics.json file', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, analytics, validateAnalyticsOutput, contents, deserialized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerForBasic();
                        return [4 /*yield*/, packer.analyze()];
                    case 1:
                        analytics = _a.sent();
                        expect(analyticsToSnapshot(analytics)).toMatchSnapshot();
                        validateAnalyticsOutput = function () {
                            var contents = utils_1.fs.readFileSync(path_1.resolve(BASIC_CWD, 'temp', '.monopacker', 'monopacker.analytics.json'), 'utf8');
                            expect(contents).toBeDefined();
                        };
                        expect(validateAnalyticsOutput).not.toThrow();
                        validateAnalyticsOutput();
                        try {
                            contents = utils_1.fs.readFileSync(path_1.resolve(BASIC_CWD, 'temp', '.monopacker', 'monopacker.analytics.json'), 'utf8');
                            expect(contents).toBeDefined();
                            deserialized = JSON.parse(contents);
                            expect(deserialized).toBeTruthy();
                            expect(analyticsToSnapshot(deserialized)).toMatchSnapshot();
                            expect(deserialized.dependencies.external).toBeDefined();
                            expect(deserialized.dependencies.internal).toBeDefined();
                            expect(deserialized.dependencies.peer).toBeDefined();
                            expect(deserialized.dependencies.internal.length).toEqual(1);
                            expect(deserialized.dependencies.peer.smallest).toBeDefined();
                        }
                        catch (err) { }
                        return [2 /*return*/];
                }
            });
        }); });
        it('should generate an artificial package correctly', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, generatedPkg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerForBasic();
                        return [4 /*yield*/, packer.pack()];
                    case 1:
                        _a.sent();
                        generatedPkg = require(path_1.join(BASIC_CWD, 'temp', 'package.json'));
                        expect(generatedPkg).toBeTruthy();
                        expect(generatedPkg).toMatchSnapshot();
                        expect(generatedPkg.name).toEqual('@fixture/main-packed');
                        expect(generatedPkg.dependencies).toStrictEqual({
                            'ansi-styles': '4.0.0',
                            debug: '*',
                            smallest: '1.0.1',
                            'supports-color': '7.0.0' // from subsubsub
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('should copy the source files correctly', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, contents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerForBasic();
                        return [4 /*yield*/, packer.pack()];
                    case 1:
                        _a.sent();
                        contents = require(path_1.join(BASIC_CWD, 'temp', 'src', 'test.js'));
                        expect(contents).toEqual('Hello world');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should copy sub-modules correctly', function () { return __awaiter(_this, void 0, void 0, function () {
            var fakeHook, packer;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        fakeHook = jest.fn(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, Promise.resolve()];
                        }); }); });
                        packer = createTestPackerForBasic((_a = {},
                            _a[types_1.HookPhase.INIT] = [fakeHook],
                            _a[types_1.HookPhase.PACKED] = [fakeHook],
                            _a[types_1.HookPhase.POSTANALYZE] = [fakeHook],
                            _a[types_1.HookPhase.POSTCOPY] = [fakeHook],
                            _a[types_1.HookPhase.POSTINSTALL] = [fakeHook],
                            _a[types_1.HookPhase.PREANALYZE] = [fakeHook],
                            _a[types_1.HookPhase.PRELINK] = [fakeHook],
                            _a[types_1.HookPhase.POSTLINK] = [fakeHook],
                            _a[types_1.HookPhase.PRECOPY] = [fakeHook],
                            _a[types_1.HookPhase.PREINSTALL] = [fakeHook],
                            _a));
                        // TODO: call time was 10 before, we removed install as default
                        return [4 /*yield*/, packer.pack()];
                    case 1:
                        // TODO: call time was 10 before, we removed install as default
                        _b.sent();
                        expect(fakeHook).toBeCalledTimes(7);
                        return [2 /*return*/];
                }
            });
        }); });
        it.skip('should install all external modules', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, debugExists, msExists, smallestExists, arrayExists;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerForBasic();
                        return [4 /*yield*/, packer.pack()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, utils_1.fs.pathExists(path_1.resolve(BASIC_CWD, 'temp', 'node_modules', 'debug'))];
                    case 2:
                        debugExists = _a.sent();
                        expect(debugExists).toBe(true);
                        return [4 /*yield*/, utils_1.fs.pathExists(path_1.resolve(BASIC_CWD, 'temp', 'node_modules', 'ms'))];
                    case 3:
                        msExists = _a.sent();
                        expect(msExists).toBe(true);
                        return [4 /*yield*/, utils_1.fs.pathExists(path_1.resolve(BASIC_CWD, 'temp', 'node_modules', 'smallest'))];
                    case 4:
                        smallestExists = _a.sent();
                        expect(smallestExists).toBe(true);
                        return [4 /*yield*/, utils_1.fs.pathExists(path_1.resolve(BASIC_CWD, 'temp', 'node_modules', 'to-array'))];
                    case 5:
                        arrayExists = _a.sent();
                        expect(arrayExists).toBe(true);
                        return [2 /*return*/];
                }
            });
        }); });
        it.todo('should generate a valid repository file');
        it.todo('should pack all internal modules to tarballs' /*, async () => {
        const packer = createTestPackerForBasic();
        await packer.pack();

        // const baseFolderExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', '@fixture'));
        // expect(baseFolderExists).toBe(true);

        // const subModuleExists = await fs.pathExists(resolve(BASIC_CWD, 'temp', 'node_modules', '@fixture', 'sub'));
        // expect(subModuleExists).toBe(true);

        // expect(require(resolve(BASIC_CWD, 'temp', 'node_modules', '@fixture', 'sub', 'src', 'index.js'))).toEqual(
        // 	'Hello from sub'
        // );
    }*/);
        it('should generate correct metadata for the packed bundle', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, generatedPkg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerForBasic();
                        return [4 /*yield*/, packer.pack()];
                    case 1:
                        _a.sent();
                        generatedPkg = require(path_1.join(BASIC_CWD, 'temp', 'package.json'));
                        expect(generatedPkg).toBeDefined();
                        expect(generatedPkg.monopacker).toBeDefined();
                        expect(generatedPkg.monopacker).toMatchSnapshot();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should generate a hash for the packed bundle', function () { return __awaiter(_this, void 0, void 0, function () {
            var packer, generatedPkg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        packer = createTestPackerForBasic();
                        return [4 /*yield*/, packer.pack()];
                    case 1:
                        _a.sent();
                        generatedPkg = require(path_1.join(BASIC_CWD, 'temp', 'package.json'));
                        expect(generatedPkg).toBeDefined();
                        expect(generatedPkg.monopacker).toBeDefined();
                        expect(generatedPkg.monopacker.hash).toBeDefined();
                        expect(generatedPkg.monopacker.hash.length).toBeGreaterThan(0);
                        expect(generatedPkg.monopacker.hash).toMatchSnapshot();
                        return [2 /*return*/];
                }
            });
        }); });
        describe('circular dependencies', function () {
            it('should detect endless cycles in dependencies', function () { return __awaiter(_this, void 0, void 0, function () {
                var packer, willFailDueCircular;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            packer = createTestPackerForcircular();
                            willFailDueCircular = function () { return __awaiter(_this, void 0, void 0, function () {
                                var err_3;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, packer.validate()];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            err_3 = _a.sent();
                                            throw new Error(err_3);
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, expect(willFailDueCircular()).rejects.toThrow('Error: @fixture/circular-a relies on @fixture/circular-b and vice versa, please fix this circular dependency')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should abort packing if detecting circular dependencies', function () { return __awaiter(_this, void 0, void 0, function () {
                var fakePackedHook, packer, willFailDueCircular;
                var _a;
                var _this = this;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            fakePackedHook = jest.fn(function () { return Promise.resolve(); });
                            packer = createTestPackerForcircular((_a = {},
                                _a[types_1.HookPhase.PACKED] = [fakePackedHook],
                                _a));
                            willFailDueCircular = function () { return __awaiter(_this, void 0, void 0, function () {
                                var err_4;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, packer.pack()];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            err_4 = _a.sent();
                                            throw new Error(err_4);
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, expect(willFailDueCircular()).rejects.toThrow('Error: @fixture/circular-a relies on @fixture/circular-b and vice versa, please fix this circular dependency')];
                        case 1:
                            _b.sent();
                            expect(fakePackedHook).toHaveBeenCalledTimes(0);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('multitree dependencies', function () {
            it('should analyze multitree dependencies correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var packer, analytics;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            packer = createTestPackerForMultitree();
                            return [4 /*yield*/, packer.analyze(false)];
                        case 1:
                            analytics = _a.sent();
                            expect(analyticsToSnapshot(analytics)).toMatchSnapshot();
                            expect(analytics.graph).toStrictEqual({
                                '@fixture/multitree-a': {
                                    smallest: '1.0.1'
                                },
                                '@fixture/multitree-ab': {},
                                '@fixture/multitree-b': {
                                    ms: '2.1.2'
                                },
                                '@fixture/multitree-c': {
                                    external: {
                                        ms: '2.1.2',
                                        smallest: '1.0.1'
                                    },
                                    internal: {
                                        '@fixture/multitree-a': '1.0.0',
                                        '@fixture/multitree-ab': '1.0.0',
                                        '@fixture/multitree-b': '1.0.0'
                                    }
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
            it('should pack multitree apps correctly', function () { return __awaiter(_this, void 0, void 0, function () {
                var packer, analytics, generatedPkg;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            packer = createTestPackerForMultitree();
                            return [4 /*yield*/, packer.analyze()];
                        case 1:
                            analytics = _a.sent();
                            return [4 /*yield*/, packer.pack()];
                        case 2:
                            _a.sent();
                            generatedPkg = require(path_1.join(MULTITREE_CWD, 'temp', 'package.json'));
                            expect(generatedPkg).toMatchSnapshot();
                            expect(generatedPkg).toStrictEqual({
                                name: '@fixture/multitree-c-packed',
                                version: '1.0.0',
                                description: '',
                                scripts: {
                                    postinstall: 'npm i --no-scripts ./.monopacker/fixture-multitree-ab-1.0.0.tgz ./.monopacker/fixture-multitree-a-1.0.0.tgz ./.monopacker/fixture-multitree-b-1.0.0.tgz'
                                },
                                monopacker: {
                                    hash: analytics.integrity,
                                    version: '1',
                                    linked: {
                                        '@fixture/multitree-ab': '1.0.0',
                                        '@fixture/multitree-a': '1.0.0',
                                        '@fixture/multitree-b': '1.0.0'
                                    }
                                },
                                dependencies: {
                                    smallest: '1.0.1',
                                    ms: '2.1.2'
                                }
                            });
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('self-referencing packages', function () {
            it('should splice itself from the ref list', function () { return __awaiter(_this, void 0, void 0, function () {
                var packer, willFailDueCircular;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            packer = createTestPackerForSelf();
                            willFailDueCircular = function () { return __awaiter(_this, void 0, void 0, function () {
                                var err_5;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, packer.validate()];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            err_5 = _a.sent();
                                            throw new Error(err_5);
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, expect(willFailDueCircular()).rejects.toThrow('Error: @fixture/self-main relies on @fixture/self-main and vice versa, please fix this circular dependency')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        describe('multiple identical package names', function () {
            it('should abort if multiple packages have the same name', function () { return __awaiter(_this, void 0, void 0, function () {
                var packer, willFailDueDuplicates;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            packer = createTestPackerForDuplicates();
                            willFailDueDuplicates = function () { return __awaiter(_this, void 0, void 0, function () {
                                var err_6;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            return [4 /*yield*/, packer.validate()];
                                        case 1:
                                            _a.sent();
                                            return [3 /*break*/, 3];
                                        case 2:
                                            err_6 = _a.sent();
                                            throw new Error(err_6);
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, expect(willFailDueDuplicates()).rejects.toThrow('Duplicate package names found: @fixture/duplicate-a')];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
    });
});
//# sourceMappingURL=Packer.test.js.map