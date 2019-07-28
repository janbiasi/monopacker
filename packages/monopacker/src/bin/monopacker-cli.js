#!/usr/bin/env node
'use strict';
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
var commander = require("commander");
var commands_1 = require("./commands");
var Lerna_1 = require("../adapter/Lerna");
var program = new commander.Command();
var sourcePkg = require('../../package.json');
program
    .version(sourcePkg.version || 'nA.')
    .option('-d, --debug', 'Enable debug mode', false)
    .option('-v, --verbose', 'Silent mode', false)
    .allowUnknownOption(false);
program
    .command('validate <source>')
    .alias('v')
    .description('Checks if a package is packable by resolving all packages theoretically')
    .option('-r, --root <dir>', 'Set a custom root directory, default: process.cwd()', process.cwd())
    .action(function (source, _a) {
    var root = _a.root, _b = _a.verbose, verbose = _b === void 0 ? false : _b;
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, commands_1.validate(path_1.resolve(root), source)];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
})
    .on('--help', function () {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ monpacker validate ./packages/main');
    console.log('  $ monopacker v packages/main');
});
program
    .command('analyze <source>')
    .alias('a')
    .description('Analyze a packable package')
    .option('-r, --root <dir>', 'Set a custom root directory, default: process.cwd()', process.cwd())
    .action(function (source, _a) {
    var root = _a.root, _b = _a.verbose, verbose = _b === void 0 ? false : _b;
    return __awaiter(_this, void 0, void 0, function () {
        var analytics;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, commands_1.analyze(path_1.resolve(root), source)];
                case 1:
                    analytics = _c.sent();
                    console.log('');
                    console.log(JSON.stringify(analytics, null, 2));
                    console.log('');
                    return [2 /*return*/];
            }
        });
    });
})
    .on('--help', function () {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ monpacker analyze ./packages/main');
    console.log('  $ monopacker a packages/main');
});
program
    .command('pack <source> [target]')
    .alias('p')
    .description('Pack an application from a monorepository')
    .option('-r, --root <dir>', 'Set a custom root directory, default: process.cwd()', process.cwd())
    .option('-c, --copy [dirs]', 'Custom copy settings, pass in format "dir1,!notDir2"')
    .option('-nc, --noCache', 'Disable caching', false)
    .option('-a, --adapter [name]', 'Set adapter for packing, allowed: lerna, nx', /^(lerna|nx)$/i, 'lerna')
    .action(function (source, target, _a) {
    var _b = _a.noCache, noCache = _b === void 0 ? false : _b, adapter = _a.adapter, copy = _a.copy, root = _a.root, _c = _a.debug, debug = _c === void 0 ? false : _c, _d = _a.verbose, verbose = _d === void 0 ? false : _d;
    return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (adapter) {
                        console.warn("Custom adapters are not supported yet, you passed " + adapter + " but lerna will be used atm.");
                    }
                    return [4 /*yield*/, commands_1.pack({
                            cwd: path_1.resolve(root),
                            source: source,
                            target: target,
                            debug: verbose ? false : debug,
                            copy: copy ? copy.split('') : undefined,
                            cache: !noCache,
                            internals: [],
                            adapter: Lerna_1.AdapterLerna
                        })];
                case 1:
                    _e.sent();
                    return [2 /*return*/];
            }
        });
    });
})
    .on('--help', function () {
    console.log('');
    console.log('Examples:');
    console.log('');
    console.log('  $ monpacker pack ./packages/main ./packed/main');
    console.log('  $ monopacker p packages/main');
});
// error on unknown commands
program.on('command:*', function () {
    console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
    process.exit(1);
});
(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        program.parse(process.argv);
        return [2 /*return*/];
    });
}); })();
//# sourceMappingURL=monopacker-cli.js.map