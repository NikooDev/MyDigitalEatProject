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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = require("../../interfaces/User");
const Container_1 = __importDefault(require("../../core/service/Container"));
const DaoService_1 = __importDefault(require("./DaoService"));
const Deliveryman_1 = __importDefault(require("../entities/Deliveryman"));
const handler_1 = __importDefault(require("../../core/response/handler"));
const UserService_1 = __importDefault(require("./UserService"));
const Inject_1 = __importDefault(require("../../core/service/Inject"));
class DeliverymanService extends DaoService_1.default {
    constructor() {
        super('deliverymans');
    }
    create(entity) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let newDeliveryman = new Deliveryman_1.default({
                user: {
                    email: entity.email.toLowerCase(),
                    password: entity.password,
                    name: entity.name,
                    phone: entity.phone,
                    role: User_1.RoleEnum.DELIVERYMAN,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                status: User_1.StatusEnum.AVAILABLE,
                address: entity.address,
                user_id: null
            });
            yield newDeliveryman.hashPassword(entity.password);
            const lastInsertId = yield this.userService.create(newDeliveryman.user);
            if (lastInsertId) {
                newDeliveryman = new Deliveryman_1.default(Object.assign(Object.assign({}, newDeliveryman), { user_id: lastInsertId }));
                const { user, id } = newDeliveryman, customer = __rest(newDeliveryman, ["user", "id"]);
                newDeliveryman.user = Object.assign({ id: lastInsertId }, newDeliveryman.user);
                yield _super.create.call(this, customer);
                delete newDeliveryman.user.password;
                return {
                    code: 200,
                    data: newDeliveryman,
                    message: 'Votre compte livreur a bien été créé'
                };
            }
            else {
                handler_1.default.logger('Échec de la récupération du dernier identifiant', 'error');
                return {
                    code: 500,
                    data: null,
                    message: 'Une erreur interne est survenue'
                };
            }
        });
    }
    read(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user) {
                return {
                    data: null,
                    code: 404,
                    message: 'Accès interdit, veuillez vous identifier'
                };
            }
            const deliverymans = yield this.select(false, 'user_id', 'address', 'status')
                .selectJoin('users', false, false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
                .join('INNER JOIN', 'users', 'users.id', 'deliverymans.user_id')
                .where('deliverymans.user_id', '=', user.id)
                .run();
            const deliveries = yield this.select(false, 'user_id', 'address', 'status')
                .groupBy('deliveries.id', 'restaurants.id', 'deliverymans.id', 'customers.address')
                .selectJoin('deliveries', false, false, 'id', 'customer_id', 'deliveryman_id', 'restaurant_id', 'status', 'created_at')
                .join('LEFT JOIN', 'deliveries', 'deliveries.deliveryman_id', user.id.toString())
                .selectJoin('customers', false, false, 'user_id', 'address')
                .join('INNER JOIN', 'customers', 'customers.user_id', 'deliveries.customer_id')
                .selectJoin('restaurants', false, false, 'user_id', 'card_id', 'description', 'address')
                .join('LEFT JOIN', 'restaurants', 'restaurants.user_id', 'deliveries.restaurant_id')
                .selectJoin('menus', true, true, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
                .join('LEFT JOIN', 'menus', 'menus.restaurant_id', 'deliveries.restaurant_id')
                .selectJoin('dishes', true, true, 'id', 'card_id', 'restaurant_id', 'name', 'price')
                .join('LEFT JOIN', 'dishes', 'dishes.restaurant_id', 'deliveries.restaurant_id')
                .where('deliverymans.user_id', '=', user.id)
                .run();
            if (deliverymans.length === 0) {
                return {
                    data: null,
                    code: 403,
                    message: 'Vous n\'êtes pas autorisé à accéder à cette ressource'
                };
            }
            deliveries.forEach(delivery => {
                delivery.menu = JSON.parse(delivery.menu);
                delivery.dishe = JSON.parse(delivery.dishe);
                return delivery;
            });
            const deliveryman = Object.assign(Object.assign({}, deliverymans[0]), { deliveries: deliveries });
            return {
                code: 200,
                data: deliveryman,
                message: ''
            };
        });
    }
    update(entity, id) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const deliverymanExists = yield this.select(false, 'id', 'user_id', 'status', 'address')
                .selectJoin('users', false, false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
                .join('INNER JOIN', 'users', 'users.id', 'deliverymans.user_id')
                .where('deliverymans.user_id', '=', id)
                .run();
            const deliverymanExist = deliverymanExists[0];
            if (deliverymanExist) {
                const updateDeliveryman = new Deliveryman_1.default({
                    id: deliverymanExist.id,
                    user_id: deliverymanExist.user_id,
                    address: (_a = entity.address) !== null && _a !== void 0 ? _a : deliverymanExist.address,
                    status: (_b = entity.status) !== null && _b !== void 0 ? _b : deliverymanExist.status,
                    user: {
                        id: deliverymanExist.user.id,
                        email: (_c = entity.email) !== null && _c !== void 0 ? _c : deliverymanExist.user.email.toLowerCase(),
                        password: entity.password,
                        name: (_d = entity.name) !== null && _d !== void 0 ? _d : deliverymanExist.user.name,
                        phone: (_e = entity.phone) !== null && _e !== void 0 ? _e : deliverymanExist.user.phone,
                        role: deliverymanExist.user.role,
                        created_at: deliverymanExist.user.created_at,
                        updated_at: new Date(),
                    }
                });
                if (entity.password) {
                    yield updateDeliveryman.hashPassword(entity.password);
                }
                yield this.userService.update(updateDeliveryman.user, deliverymanExist.user_id);
                const { user } = updateDeliveryman, deliveryman = __rest(updateDeliveryman, ["user"]);
                yield _super.update.call(this, deliveryman, deliverymanExist.id);
                delete updateDeliveryman.user.password;
                return {
                    code: 200,
                    data: updateDeliveryman,
                    message: 'Votre compte livreur a bien été modifié'
                };
            }
            else {
                return {
                    code: 404,
                    data: null,
                    message: 'Ce compte livreur n\'existe pas'
                };
            }
        });
    }
}
__decorate([
    (0, Inject_1.default)('UserService'),
    __metadata("design:type", UserService_1.default)
], DeliverymanService.prototype, "userService", void 0);
Container_1.default.register('DeliverymanService', new DeliverymanService());
exports.default = DeliverymanService;
//# sourceMappingURL=DeliverymanService.js.map