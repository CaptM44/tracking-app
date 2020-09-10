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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var express = require("express");
var puppeteer = require("puppeteer");
var chrono = require("chrono-node");
var app = express();
var port = process.env.PORT || 3000;
var browser;
app.get('/', function (req, res) { return res.send('Hello World!'); });
app.get('/track/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var id, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                id = req.params.id;
                _b = (_a = res).json;
                return [4 /*yield*/, getTracking(id)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () { return init(); });
//init app
function init() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("App listening on port " + port);
                    return [4 /*yield*/, puppeteer.launch()];
                case 1:
                    browser = _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//get tracking
function getTracking(id) {
    return __awaiter(this, void 0, void 0, function () {
        var page, link, dateEl, dateText, _a, date, statusEl, statusText, _b, status;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, browser.newPage()];
                case 1:
                    page = _c.sent();
                    link = "https://www.fedex.com/apps/fedextrack/?tracknumbers=" + id + "&locale=en_US";
                    return [4 /*yield*/, page.goto(link)];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, page.waitForSelector('.tank-heading-primary', { timeout: 5000 }).catch(function (t) { return null; })];
                case 3:
                    dateEl = _c.sent();
                    _a = dateEl;
                    if (!_a) return [3 /*break*/, 5];
                    return [4 /*yield*/, page.evaluate(function (t) { return t.textContent; }, dateEl)];
                case 4:
                    _a = (_c.sent());
                    _c.label = 5;
                case 5:
                    dateText = _a;
                    date = dateText && chrono.parseDate(dateText);
                    return [4 /*yield*/, page.waitForSelector('.statusChevron_key_status', { timeout: 5000 }).catch(function (t) { return null; })];
                case 6:
                    statusEl = _c.sent();
                    _b = statusEl;
                    if (!_b) return [3 /*break*/, 8];
                    return [4 /*yield*/, page.evaluate(function (t) { return t.textContent; }, statusEl)];
                case 7:
                    _b = (_c.sent());
                    _c.label = 8;
                case 8:
                    statusText = _b;
                    status = normalizeStatus(statusText);
                    return [2 /*return*/, {
                            status: status,
                            date: date,
                            link: link
                        }];
            }
        });
    });
}
//normalize status
function normalizeStatus(status) {
    var s = status && status.toLowerCase();
    if (s == null) {
        return 'Not Available';
    }
    if (s == 'initiated') {
        return 'Initiated';
    }
    if (s == 'picked up') {
        return 'Picked up';
    }
    if (s == 'in transit') {
        return 'In Transit';
    }
    if (s == 'delivered') {
        return 'Delivered';
    }
    return status;
}
