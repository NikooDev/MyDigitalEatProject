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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../interfaces/User");
const UserService_1 = __importDefault(require("../services/UserService"));
const MenuService_1 = __importDefault(require("../services/MenuService"));
const DisheService_1 = __importDefault(require("../services/DisheService"));
const handler_1 = __importDefault(require("../../core/response/handler"));
const Inject_1 = __importDefault(require("../../core/service/Inject"));
const dotenv_1 = __importDefault(require("dotenv"));
const DeliveryService_1 = __importDefault(require("../services/DeliveryService"));
dotenv_1.default.config();
/**
 * @Class Auth
 * @description Vérifie l'authentification de l'utilisateur
 * Vérifie si l'utilisateur a bien un rôle défini
 */
class Auth {
    isAuth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorizationHeader = req.headers['authorization'];
            if (!authorizationHeader) {
                return handler_1.default.exception(res, 'Accès refusé, un token est requis pour accéder à ce contenu', 401);
            }
            const token = authorizationHeader.split(' ')[1];
            const secret = process.env.JWT_SECRET;
            try {
                const userDecoded = jsonwebtoken_1.default.verify(token.toString(), secret);
                req.user = userDecoded;
                return next();
            }
            catch (err) {
                err instanceof Error && handler_1.default.logger(err.message, 'error');
                let message, code;
                if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    code = 403;
                    message = 'Accès refusé, le token a expiré, veuillez-vous authentifier à nouveau';
                }
                else if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    code = 403;
                    message = 'Accès refusé, veuillez-vous authentifier';
                }
                else {
                    code = 401;
                    message = 'Accès refusé, le token est invalide';
                }
                return handler_1.default.exception(res, message, code);
            }
        });
    }
    isRole(role) {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (req.user && req.user.role === role) {
                yield Auth.nextParams(req, res, next);
            }
            else {
                let roleString, roleUser;
                switch (req.user.role) {
                    case User_1.RoleEnum.CUSTOMER:
                        roleUser = 'client';
                        break;
                    case User_1.RoleEnum.RESTAURANT:
                        roleUser = 'restaurant';
                        break;
                    case User_1.RoleEnum.DELIVERYMAN:
                        roleUser = 'livreur';
                        break;
                    default:
                        break;
                }
                switch (role) {
                    case User_1.RoleEnum.CUSTOMER:
                        roleString = 'client';
                        break;
                    case User_1.RoleEnum.RESTAURANT:
                        roleString = 'restaurant';
                        break;
                    case User_1.RoleEnum.DELIVERYMAN:
                        roleString = 'livreur';
                        break;
                    default:
                        break;
                }
                return Auth.handler(res, roleString, roleUser);
            }
        });
    }
    isAll(req, res, next) {
        if ((req.user && (req.user.role == User_1.RoleEnum.CUSTOMER)
            || (req.user.role == User_1.RoleEnum.RESTAURANT)
            || (req.user.role == User_1.RoleEnum.DELIVERYMAN))) {
            return Auth.nextParams(req, res, next);
        }
        else {
            return Auth.handler(res);
        }
    }
    isCustomerOrRestaurant(req, res, next) {
        if ((req.user && (req.user.role == User_1.RoleEnum.CUSTOMER)
            || (req.user.role == User_1.RoleEnum.RESTAURANT))) {
            return Auth.nextParams(req, res, next);
        }
        else {
            return Auth.handler(res, 'client ou un restaurant');
        }
    }
    static nextParams(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = req.path.split('/')[1];
            // Pour chaque route, je vérifie l'authenticité de l'utilisateur
            if (req.params.id) {
                switch (entity) {
                    case 'customers':
                    case 'deliverymans':
                    case 'restaurants':
                        // Vérifie si l'utilisateur existe
                        if ((req.user && (req.user.id.toString() === req.params.id))) {
                            return next();
                        }
                        else {
                            const userExists = yield this.userService.select(true, 'COUNT(id) as count_id')
                                .where('id', '=', req.params.id)
                                .run();
                            const userExist = userExists[0];
                            return Auth.nextParamsUsersError(res, userExist.count_id);
                        }
                    case 'deliveries':
                        // Vérifie si la livraison existe
                        const deliveryExists = yield this.deliveryService.select(true, 'COUNT(deliveries.id) as count_id')
                            .where('id', '=', req.params.id)
                            .andWhere('restaurant_id', '=', req.user.id)
                            .orWhere('customer_id', '=', req.user.id)
                            .run();
                        const deliveryExist = deliveryExists[0];
                        if (deliveryExist && deliveryExist.count_id > 0) {
                            next();
                        }
                        else {
                            return Auth.nextParamsError(res, 'Cette commande n\'existe pas ou vous n\'avez pas l\'autorisation nécessaire');
                        }
                        break;
                    case 'menus':
                        // Vérifie si le menu existe et que le restaurant est bien le propriétaire
                        const menuExists = yield this.menuService.select(true, 'COUNT(menus.id) as count_id')
                            .where('id', '=', req.params.id)
                            .andWhere('restaurant_id', '=', req.user.id)
                            .run();
                        const menuExist = menuExists[0];
                        if (menuExist && menuExist.count_id > 0) {
                            next();
                        }
                        else {
                            return Auth.nextParamsError(res, 'Ce menu n\'existe pas ou vous n\'avez pas l\'autorisation nécessaire');
                        }
                        break;
                    case 'dishes':
                        // Vérifie si le plat existe et que le restaurant est bien le propriétaire
                        const disheExists = yield this.disheService.select(true, 'COUNT(dishes.id) as count_id')
                            .where('id', '=', req.params.id)
                            .andWhere('restaurant_id', '=', req.user.id)
                            .run();
                        const disheExist = disheExists[0];
                        if (disheExist && disheExist.count_id > 0) {
                            next();
                        }
                        else {
                            return Auth.nextParamsError(res, 'Ce plat n\'existe pas ou vous n\'avez pas l\'autorisation nécessaire');
                        }
                        break;
                }
            }
            else {
                return next();
            }
        });
    }
    static nextParamsUsersError(res, count_id) {
        let message, code;
        if (count_id > 0) {
            message = 'Accès refusé, vous n\'avez pas l\'autorisation nécessaire';
            code = 403;
        }
        else {
            message = 'L\'utilisateur n\'existe pas';
            code = 404;
        }
        return handler_1.default.exception(res, message, code);
    }
    static nextParamsError(res, message) {
        return handler_1.default.exception(res, message, 403);
    }
}
Auth.handler = (res, role, currentRole) => {
    return handler_1.default.exception(res, role
        ? `Accès refusé, vous êtes un ${currentRole}. Vérifiez si vous êtes authentifié avec le bon token et si vous êtes bien un ${role}`
        : 'Accès refusé', 403);
};
__decorate([
    (0, Inject_1.default)('UserService'),
    __metadata("design:type", UserService_1.default)
], Auth, "userService", void 0);
__decorate([
    (0, Inject_1.default)('DeliveryService'),
    __metadata("design:type", DeliveryService_1.default)
], Auth, "deliveryService", void 0);
__decorate([
    (0, Inject_1.default)('MenuService'),
    __metadata("design:type", MenuService_1.default)
], Auth, "menuService", void 0);
__decorate([
    (0, Inject_1.default)('DisheService'),
    __metadata("design:type", DisheService_1.default)
], Auth, "disheService", void 0);
exports.default = new Auth();
//# sourceMappingURL=Auth.js.map