"use strict";
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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
const DaoService_1 = __importDefault(require("./DaoService"));
const Container_1 = __importDefault(require("../../core/service/Container"));
dotenv_1.default.config();
class UserService extends DaoService_1.default {
    constructor() {
        super('users');
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const secret = process.env.JWT_SECRET;
            const userExists = yield this.select(false, 'email', 'password', 'id', 'role', 'created_at')
                .where('email', '=', email)
                .run();
            const user = userExists[0];
            if (!user) {
                return {
                    code: 404,
                    success: false,
                    message: 'Cette adresse e-mail appartient à aucun compte'
                };
            }
            const samePasswords = yield bcrypt_1.default.compare(password, user.password);
            // Si les mots de passe sont identiques
            if (samePasswords) {
                const userToken = {
                    id: user.id,
                    role: user.role,
                    created_at: user.created_at
                };
                const token = jsonwebtoken_1.default.sign(userToken, secret, {
                    expiresIn: '30d',
                });
                delete user.password;
                return {
                    user,
                    token
                };
            }
            else {
                return {
                    code: 401,
                    success: false,
                    message: 'Vos identifiants sont incorrects'
                };
            }
        });
    }
    create(entity) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.create.call(this, entity);
            const lastInsertId = yield this.select(true, 'LAST_INSERT_ID() AS id')
                .limit(1)
                .run();
            if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
                return lastInsertId[0].id;
            }
        });
    }
    delete(id) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const userExists = yield this.select(false, 'id')
                .where('id', '=', id)
                .run();
            const userExist = userExists[0];
            if (userExist) {
                yield _super.delete.call(this, id);
                return {
                    code: 200,
                    data: null,
                    message: 'L\'utilisateur a bien été supprimé'
                };
            }
            else {
                return {
                    code: 404,
                    data: null,
                    message: 'Cet utilisateur n\'existe pas'
                };
            }
        });
    }
}
Container_1.default.register('UserService', new UserService());
exports.default = UserService;
//# sourceMappingURL=UserService.js.map