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
const UserService_1 = __importDefault(require("../services/UserService"));
const Inject_1 = __importDefault(require("../../core/service/Inject"));
/**
 * @Class Email
 * @description Vérifie l'unicité d'une adresse e-mail
 */
class Email {
    isUnique(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const userEmail = req.body.email;
            if (!userEmail) {
                return next();
            }
            yield handler_1.default.tryCatch(res, errors_1.middleware.email, () => __awaiter(this, void 0, void 0, function* () {
                // Je retourne next() si l'utilisateur ne modifie pas son adresse e-mail
                if (req.user && req.user.id) {
                    const userExists = yield this.userService
                        .select(false, 'id', 'email')
                        .where('id', '=', req.user.id.toString())
                        .andWhere('email', '=', userEmail)
                        .run();
                    const userExist = userExists[0];
                    if (userExist && userExist.email && userExist.email === userEmail) {
                        return next();
                    }
                }
                // Je vérifie si l'adresse e-mail existe déjà
                const emailExists = yield this.userService
                    .select(true, 'COUNT(email) AS email_count')
                    .where('email', '=', userEmail)
                    .run();
                const emails = emailExists[0];
                if (emails.email_count > 0) {
                    return handler_1.default.exception(res, 'Cette adresse e-mail est déjà utilisée', 409);
                }
                next();
            }));
        });
    }
}
__decorate([
    (0, Inject_1.default)('UserService'),
    __metadata("design:type", UserService_1.default)
], Email.prototype, "userService", void 0);
exports.default = new Email();
//# sourceMappingURL=Email.js.map