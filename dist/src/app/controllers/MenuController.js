"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../core/constants/errors");
const handler_1 = __importDefault(require("../../core/response/handler"));
const MenuService_1 = __importDefault(require("../services/MenuService"));
const Inject_1 = __importDefault(require("../../core/service/Inject"));
class MenuController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            const user = req.user;
            yield handler_1.default.tryCatch(res, errors_1.menuController.create, () => __awaiter(this, void 0, void 0, function* () {
                const menu = yield this.menuService.create(data, user);
                return (handler_1.default[menu.code === 200 ? 'success' : 'exception'])(res, menu.message, menu.code, { menu: menu.data });
            }));
        });
    }
    read(_, res) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler_1.default.tryCatch(res, errors_1.menuController.read, () => __awaiter(this, void 0, void 0, function* () {
                const menus = yield this.menuService.read();
                return (handler_1.default[menus.code === 200 ? 'success' : 'exception'])(res, menus.message, menus.code, { menus: menus.data });
            }));
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            const params = req.params;
            yield handler_1.default.tryCatch(res, errors_1.menuController.update, () => __awaiter(this, void 0, void 0, function* () {
                const menus = yield this.menuService.update(data, params.id);
                return (handler_1.default[menus.code === 200 ? 'success' : 'exception'])(res, menus.message, menus.code, { menus: menus.data });
            }));
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = req.params;
            yield handler_1.default.tryCatch(res, errors_1.menuController.update, () => __awaiter(this, void 0, void 0, function* () {
                const menus = yield this.menuService.delete(params.id);
                return (handler_1.default[menus.code === 200 ? 'success' : 'exception'])(res, menus.message, menus.code);
            }));
        });
    }
}
__decorate([
    (0, Inject_1.default)('MenuService'),
    __metadata("design:type", MenuService_1.default)
], MenuController.prototype, "menuService", void 0);
exports.default = new MenuController();
//# sourceMappingURL=MenuController.js.map