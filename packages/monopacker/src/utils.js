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
var crypto_1 = require("crypto");
var execa = require("execa");
exports.execa = execa;
var _rimraf = require("rimraf");
var fs = require("fs-extra");
exports.fs = fs;
var glob = require("glob");
var matcher = require("matcher");
exports.matcher = matcher;
var ncp_1 = require("ncp");
function findDuplicatesInArray(array) {
    var object = {};
    var result = [];
    array.forEach(function (item) {
        if (!object[item])
            object[item] = 0;
        object[item] += 1;
    });
    for (var prop in object) {
        if (object[prop] >= 2) {
            result.push(prop);
        }
    }
    return result;
}
exports.findDuplicatesInArray = findDuplicatesInArray;
function rimraf(pathName, options) {
    if (options === void 0) { options = {}; }
    return new Promise(function (resolve, reject) {
        _rimraf(pathName, options, function (err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
exports.rimraf = rimraf;
function copyDir(source, destination, opts) {
    if (opts === void 0) { opts = {
        dereference: true
    }; }
    return new Promise(function (resolve, reject) {
        ncp_1.ncp(source, destination, opts, function (err) {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
exports.copyDir = copyDir;
function getLernaPackages2(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, execa('lerna', ['ls', '--all', '--json'], {
                        cwd: cwd
                    })];
                case 1:
                    stdout = (_a.sent()).stdout;
                    return [2 /*return*/, JSON.parse(stdout)];
            }
        });
    });
}
exports.getLernaPackages2 = getLernaPackages2;
function asyncForEach(array, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var index;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!Array.isArray(array)) {
                        return [2 /*return*/, Promise.resolve()];
                    }
                    index = 0;
                    _a.label = 1;
                case 1:
                    if (!(index < array.length)) return [3 /*break*/, 4];
                    return [4 /*yield*/, callback(array[index], index)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    index++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.asyncForEach = asyncForEach;
function extractDependencies(dependencyLike, filter) {
    if (dependencyLike === void 0) { dependencyLike = {}; }
    if (filter === void 0) { filter = function () { return true; }; }
    return Object.keys(dependencyLike)
        .filter(filter)
        .reduce(function (prev, curr) {
        var _a;
        return (__assign({}, prev, (_a = {}, _a[curr] = dependencyLike[curr], _a)));
    }, {});
}
exports.extractDependencies = extractDependencies;
function readJSON(f) {
    return __awaiter(this, void 0, void 0, function () {
        var contents, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.readFile(f)];
                case 1:
                    contents = _a.sent();
                    return [2 /*return*/, JSON.parse(contents.toString())];
                case 2:
                    err_1 = _a.sent();
                    return [2 /*return*/, {}];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.readJSON = readJSON;
function loadJson(f) {
    try {
        return JSON.parse(fs.readFileSync(f, 'utf8') || '');
    }
    catch (err) {
        return null;
    }
}
function getLernaPackages(root) {
    var patterns = (function () {
        try {
            return loadJson(root + "/lerna.json").packages;
        }
        catch (err) { }
        try {
            return loadJson(root + "/package.json").workspaces;
        }
        catch (err) { }
        return [];
    })() || [];
    var modules = patterns.reduce(function (acc, patt) {
        var found = glob.sync(patt, { cwd: root }).filter(function (f) { return !f.match(/node_modules/); });
        return acc.concat(found);
    }, []);
    var subModules = modules.reduce(function (acc, f) {
        try {
            var fname = root + "/" + f;
            var stat = fs.statSync(fname);
            fname = stat.isDirectory() ? fname : path_1.dirname(fname);
            var pkgJson = path_1.join(fname, "package.json");
            // const pkgStat = fs.statSync(pkgJson);
            var pkg_1 = loadJson(pkgJson);
            var ref_1 = path_1.resolve(path_1.relative(root, fname).replace(/[\\]+/g, '/'));
            var isDuplicate = acc.filter(function (m) { return m.location === ref_1; });
            if (!isDuplicate.length && pkg_1 && pkg_1 !== null) {
                if (!pkg_1.name || !pkg_1.version) {
                    throw new Error("Invalid package " + (pkg_1.name || '<unknown>') + " in " + ref_1 + ": name or version missing");
                }
                acc.push({
                    name: pkg_1.name,
                    version: pkg_1.version || '*',
                    description: pkg_1.description || '',
                    private: !!pkg_1.private,
                    location: ref_1
                });
            }
        }
        catch (err) {
            /* istanbul ignore next */
            throw err || 'Unable to list lerna modules';
        }
        return acc;
    }, []);
    return subModules;
}
exports.getLernaPackages = getLernaPackages;
function countMsg(countable, singular, plural) {
    plural = plural || singular + "s";
    var size = -1;
    if (Array.isArray(countable)) {
        size = countable.length;
    }
    else {
        size = Object.keys(countable).length;
    }
    return size === 1 ? "1 " + singular : size + " " + plural;
}
exports.countMsg = countMsg;
function displayPath(base, toDisplay) {
    return path_1.resolve(toDisplay).replace(path_1.resolve(base), '~');
}
exports.displayPath = displayPath;
function createHash(value) {
    return crypto_1.createHash('sha256')
        .update(value)
        .digest('hex');
}
exports.createHash = createHash;
function createIntegrityHash(version, analytics) {
    return createHash(version +
        JSON.stringify(__assign({}, analytics, { dependencies: __assign({}, analytics.dependencies, { internal: analytics.dependencies.internal.map(function (entry) { return entry.name + "@" + entry.version + "|" + !!entry.private; }) }) })));
}
exports.createIntegrityHash = createIntegrityHash;
exports.pkg = require('../package.json');
//# sourceMappingURL=utils.js.map