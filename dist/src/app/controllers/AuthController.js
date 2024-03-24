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
const Inject_1 = __importDefault(require("../../core/service/Inject"));
const errors_1 = require("../../core/constants/errors");
const UserService_1 = __importDefault(require("../services/UserService"));
const handler_1 = __importDefault(require("../../core/response/handler"));
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            yield handler_1.default.tryCatch(res, errors_1.authController.login, () => __awaiter(this, void 0, void 0, function* () {
                const auth = yield this.userService.login(data.email, data.password);
                if (!auth.token) {
                    return handler_1.default.exception(res, auth.message, auth.code);
                }
                req.user = auth.user;
                return handler_1.default.success(res, 'Vous êtes bien connecté', 200, { user: auth.user, token: auth.token });
            }));
        });
    }
}
__decorate([
    (0, Inject_1.default)('UserService'),
    __metadata("design:type", UserService_1.default)
], AuthController.prototype, "userService", void 0);
exports.default = new AuthController();
//# sourceMappingURL=AuthController.js.map