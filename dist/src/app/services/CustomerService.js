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
const DaoService_1 = __importDefault(require("./DaoService"));
const Container_1 = __importDefault(require("../../core/service/Container"));
const Customer_1 = __importDefault(require("../entities/Customer"));
const UserService_1 = __importDefault(require("./UserService"));
const handler_1 = __importDefault(require("../../core/response/handler"));
const Inject_1 = __importDefault(require("../../core/service/Inject"));
class CustomerService extends DaoService_1.default {
    constructor() {
        super('customers');
    }
    create(entity) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let newCustomer = new Customer_1.default({
                user: {
                    email: entity.email.toLowerCase(),
                    password: entity.password,
                    name: entity.name,
                    phone: entity.phone,
                    role: User_1.RoleEnum.CUSTOMER,
                    created_at: new Date(),
                    updated_at: new Date()
                },
                address: entity.address,
                user_id: null
            });
            yield newCustomer.hashPassword(entity.password);
            const lastInsertId = yield this.userService.create(newCustomer.user);
            if (lastInsertId) {
                newCustomer = new Customer_1.default(Object.assign(Object.assign({}, newCustomer), { user_id: lastInsertId }));
                const { user, id } = newCustomer, customer = __rest(newCustomer, ["user", "id"]);
                newCustomer.user = Object.assign({ id: lastInsertId }, newCustomer.user);
                yield _super.create.call(this, customer);
                delete newCustomer.user.password;
                return {
                    code: 200,
                    data: newCustomer,
                    message: 'Votre compte client a bien été créé'
                };
            }
            else {
                handler_1.default.logger('Échec de la récupération du dernier identifiant de l\'utilisateur', 'error');
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
            const customers = yield this.select(false, 'user_id')
                .selectJoin('users', false, false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
                .join('INNER JOIN', 'users', 'users.id', 'customers.user_id')
                .where('customers.user_id', '=', user.id)
                .run();
            const deliveries = yield this.select(false, 'user_id', 'address')
                .groupBy('deliveries.id', 'restaurants.id', 'deliverymans.id')
                .selectJoin('deliveries', false, false, 'id', 'customer_id', 'deliveryman_id', 'restaurant_id', 'status', 'created_at')
                .join('LEFT JOIN', 'deliveries', 'deliveries.customer_id', user.id.toString())
                .selectJoin('restaurants', false, false, 'user_id', 'card_id', 'description', 'address')
                .join('LEFT JOIN', 'restaurants', 'restaurants.user_id', 'deliveries.restaurant_id')
                .selectJoin('deliverymans', false, false, 'user_id', 'status', 'address')
                .join('LEFT JOIN', 'deliverymans', 'deliverymans.user_id', 'deliveries.deliveryman_id')
                .selectJoin('menus', true, true, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
                .join('LEFT JOIN', 'menus', 'menus.restaurant_id', 'deliveries.restaurant_id')
                .selectJoin('dishes', true, true, 'id', 'card_id', 'restaurant_id', 'name', 'price')
                .join('LEFT JOIN', 'dishes', 'dishes.restaurant_id', 'deliveries.restaurant_id')
                .where('customers.user_id', '=', user.id)
                .run();
            deliveries.forEach(delivery => {
                delivery.menu = JSON.parse(delivery.menu);
                delivery.dishe = JSON.parse(delivery.dishe);
                return delivery;
            });
            const customer = Object.assign(Object.assign({}, customers[0]), { address: deliveries[0].address, deliveries: deliveries });
            return {
                code: 200,
                data: customer,
                message: ''
            };
        });
    }
    update(entity, id) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const customersExist = yield this.select(false, 'id', 'user_id')
                .selectJoin('users', false, false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
                .join('INNER JOIN', 'users', 'users.id', 'customers.user_id')
                .where('customers.user_id', '=', id)
                .run();
            const customerExist = customersExist[0];
            if (customerExist) {
                const updateCustomer = new Customer_1.default({
                    id: customerExist.id,
                    user_id: customerExist.user_id,
                    address: (_a = entity.address) !== null && _a !== void 0 ? _a : customerExist.address,
                    user: {
                        id: customerExist.user.id,
                        email: (_b = entity.email) !== null && _b !== void 0 ? _b : customerExist.user.email.toLowerCase(),
                        password: entity.password,
                        name: (_c = entity.name) !== null && _c !== void 0 ? _c : customerExist.user.name,
                        phone: (_d = entity.phone) !== null && _d !== void 0 ? _d : customerExist.user.phone,
                        role: customerExist.user.role,
                        created_at: customerExist.user.created_at,
                        updated_at: new Date(),
                    }
                });
                if (entity.password) {
                    yield updateCustomer.hashPassword(entity.password);
                }
                yield this.userService.update(updateCustomer.user, customerExist.user_id);
                const { user } = updateCustomer, customer = __rest(updateCustomer, ["user"]);
                yield _super.update.call(this, customer, customerExist.user_id);
                delete updateCustomer.user.password;
                return {
                    code: 200,
                    data: updateCustomer,
                    message: 'Votre compte client a bien été modifié'
                };
            }
            else {
                return {
                    code: 404,
                    data: null,
                    message: 'Ce compte client n\'existe pas'
                };
            }
        });
    }
}
__decorate([
    (0, Inject_1.default)('UserService'),
    __metadata("design:type", UserService_1.default)
], CustomerService.prototype, "userService", void 0);
Container_1.default.register('CustomerService', new CustomerService());
exports.default = CustomerService;
//# sourceMappingURL=CustomerService.js.map