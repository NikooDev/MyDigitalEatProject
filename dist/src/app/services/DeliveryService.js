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
const Delivery_1 = require("../../interfaces/Delivery");
const Inject_1 = __importDefault(require("../../core/service/Inject"));
const DaoService_1 = __importDefault(require("./DaoService"));
const Container_1 = __importDefault(require("../../core/service/Container"));
const DeliverymanService_1 = __importDefault(require("./DeliverymanService"));
const RestaurantService_1 = __importDefault(require("./RestaurantService"));
const CustomerService_1 = __importDefault(require("./CustomerService"));
const Delivery_2 = __importDefault(require("../entities/Delivery"));
class DeliveryService extends DaoService_1.default {
    constructor() {
        super('deliveries');
    }
    create(entity, user) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!user) {
                return {
                    code: 403,
                    message: 'Accès refusé, veuillez-vous authentifier',
                    data: null
                };
            }
            // Attribution d'un livreur disponible au hasard à la commande
            const deliverymansAvailable = yield this.deliverymanService.select(false, 'id', 'user_id', 'status', 'address')
                .selectJoin('users', false, false, 'email', 'name', 'phone')
                .join('LEFT JOIN', 'users', 'deliverymans.user_id', 'users.id')
                .where('status', '=', User_1.StatusEnum.AVAILABLE)
                .orderBy('RAND()', 'ASC')
                .limit(1)
                .run();
            const deliverymanAvailable = deliverymansAvailable[0];
            if (!deliverymanAvailable) {
                return {
                    code: 404,
                    message: 'Il n\'y a aucun livreur disponible actuellement',
                    data: null
                };
            }
            const deliverymanDatas = {
                id: deliverymanAvailable.id,
                user_id: deliverymanAvailable.user_id,
                name: deliverymanAvailable.user.name,
                email: deliverymanAvailable.user.email,
                status: User_1.StatusEnum.ON_DELIVERY,
                address: deliverymanAvailable.address,
                phone: deliverymanAvailable.user.phone
            };
            // Vérification de l'existence du restaurant
            const restaurantExists = yield this.restaurantService.select(false, 'id', 'user_id', 'card_id', 'description', 'address')
                .selectJoin('users', false, false, 'email', 'name', 'phone')
                .join('LEFT JOIN', 'users', 'restaurants.user_id', 'users.id')
                .where('user_id', '=', entity.restaurant_id)
                .run();
            const restaurantExist = restaurantExists[0];
            if (!restaurantExist) {
                return {
                    code: 404,
                    message: `Le restaurant user_id=${entity.restaurant_id} n'existe pas`,
                    data: null
                };
            }
            if (!restaurantExist.card_id) {
                return {
                    code: 404,
                    message: `Le restaurant user_id=${entity.restaurant_id} ne possède pas de carte`,
                    data: null
                };
            }
            const restaurantDatas = {
                id: restaurantExist.id,
                user_id: restaurantExist.user_id,
                card_id: restaurantExist.card_id,
                name: restaurantExist.user.name,
                email: restaurantExist.user.email,
                description: restaurantExist.description,
                address: restaurantExist.address,
                phone: restaurantExist.user.phone
            };
            // Vérification de l'existence des menus et leur appartenance dans le restaurant existant
            const menusExists = yield this.checkMenus(entity.menus, entity.restaurant_id);
            if (menusExists.length === 0 && entity.menus && entity.menus.length > 0) {
                const plurial = entity.menus.length > 1 ? `Les menus ${entity.menus.join(', ')} n'existent` : `Le menu ${entity.menus} n'existe`;
                return {
                    code: 404,
                    message: `${plurial} pas dans le restaurant user_id=${entity.restaurant_id}`,
                    data: null
                };
            }
            const menusExist = menusExists[0];
            // Vérification de l'existence des menus et leur appartenance dans le restaurant existant
            const dishesExists = yield this.checkDishes(entity.dishes, entity.restaurant_id);
            if (dishesExists.length === 0 && entity.dishes && entity.dishes.length > 0) {
                const plurial = entity.dishes.length > 1 ? `Les plats ${entity.dishes.join(', ')} n'existent` : `Le plat ${entity.dishes} n'existe`;
                return {
                    code: 404,
                    message: `${plurial} pas dans le restaurant user_id=${entity.restaurant_id}`,
                    data: null
                };
            }
            const dishesExist = dishesExists[0];
            // Récupération des données du customer
            const customers = user.id && (yield this.customerService.select(false, 'id', 'user_id', 'address')
                .selectJoin('users', false, false, 'email', 'name', 'phone')
                .join('LEFT JOIN', 'users', 'customers.user_id', 'users.id')
                .where('user_id', '=', user.id)
                .run());
            const customer = customers[0];
            const customerDatas = {
                id: customer.id,
                user_id: customer.user_id,
                name: customer.user.name,
                email: customer.user.email,
                address: customer.address,
                phone: customer.user.phone
            };
            let newDelivery = new Delivery_2.default({
                customer_id: customerDatas.user_id,
                deliveryman_id: deliverymanDatas.user_id,
                restaurant_id: restaurantDatas.user_id,
                status: Delivery_1.DeliveryEnum.PENDING,
                created_at: new Date()
            });
            const { id } = newDelivery, delivery = __rest(newDelivery, ["id"]);
            yield _super.create.call(this, delivery);
            const lastInsertId = yield this.select(true, 'LAST_INSERT_ID() AS id')
                .limit(1)
                .run();
            if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
                newDelivery.id = lastInsertId[0].id;
            }
            // Pour chaque menu => création de l'entrée dans la table pivot orders_items
            if (menusExist && menusExist.menu && menusExist.menu.length > 0) {
                for (let i = 0; i < menusExist.menu.length; i++) {
                    yield this.createOrderDelivery(newDelivery.id, menusExist.menu[i].id, null);
                }
            }
            // Pour chaque plats => création de l'entrée dans la table pivot orders_items
            if (dishesExist && dishesExist.dishe && dishesExist.dishe.length > 0) {
                for (let i = 0; i < dishesExist.dishe.length; i++) {
                    yield this.createOrderDelivery(newDelivery.id, null, dishesExist.dishe[i].id);
                }
            }
            // Mise à jour du statut du livreur
            yield this.deliverymanService.update({ status: User_1.StatusEnum.ON_DELIVERY }, deliverymanAvailable.user_id);
            const order = Object.assign(Object.assign({}, newDelivery), { customer: customerDatas, deliveryman: deliverymanDatas, restaurant: restaurantDatas, menus: menusExist && menusExist.menu ? menusExist.menu : null, dishes: dishesExist && dishesExist.dishe ? dishesExist.dishe : null });
            return {
                code: 200,
                message: 'Votre commande a bien été créée',
                data: order
            };
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
            let deliveries = yield this.select(false, 'id', 'customer_id', 'deliveryman_id', 'restaurant_id', 'status', 'created_at')
                .groupBy('restaurants.id', 'deliverymans.id', 'customers.id')
                .selectJoin('users', false, false, 'id', 'name', 'email', 'phone', 'role')
                .join('LEFT JOIN', 'users', 'users.id', user.id.toString())
                .selectJoin('customers', false, false, 'id', 'user_id', 'address')
                .join('LEFT JOIN', 'customers', 'customers.user_id', 'deliveries.customer_id')
                .selectJoin('restaurants', false, false, 'id', 'user_id', 'card_id', 'description', 'address')
                .join('LEFT JOIN', 'restaurants', 'restaurants.user_id', 'deliveries.restaurant_id')
                .selectJoin('deliverymans', false, false, 'id', 'user_id', 'status', 'address')
                .join('LEFT JOIN', 'deliverymans', 'deliverymans.user_id', 'deliveries.deliveryman_id')
                .selectJoin('orders_deliveries', true, false, 'menu_id', 'dishe_id')
                .join('LEFT JOIN', 'orders_deliveries', 'orders_deliveries.delivery_id', 'deliveries.id')
                .selectJoin('menus', true, false, 'id', 'card_id', 'name', 'price', 'description')
                .join('LEFT JOIN', 'menus', 'menus.id', 'orders_deliveries.menu_id')
                .selectJoin('dishes', true, false, 'id', 'card_id', 'name', 'price')
                .join('LEFT JOIN', 'dishes', 'dishes.id', 'orders_deliveries.dishe_id')
                .run();
            /**
             * Détail de la requête SQL brute générée :
             *
             * SELECT deliveries.id, deliveries.customer_id, deliveries.deliveryman_id, deliveries.restaurant_id,
             * deliveries.status, deliveries.created_at,
             * JSON_OBJECT('id', users.id, 'name', users.name, 'email', users.email, 'phone', users.phone, 'role', users.role) AS user,
             * JSON_OBJECT('id', customers.id, 'user_id', customers.user_id, 'address', customers.address) AS customer,
             * JSON_OBJECT('id', restaurants.id, 'user_id', restaurants.user_id, 'card_id', restaurants.card_id, 'description', restaurants.description, 'address', restaurants.address) AS restaurant,
             * JSON_OBJECT('id', deliverymans.id, 'user_id', deliverymans.user_id, 'status', deliverymans.status, 'address', deliverymans.address) AS deliveryman,
             * JSON_ARRAYAGG(JSON_OBJECT('menu_id', orders_deliveries.menu_id, 'dishe_id', orders_deliveries.dishe_id)) AS orders_deliverie,
             * JSON_ARRAYAGG(JSON_OBJECT('id', menus.id, 'card_id', menus.card_id, 'name', menus.name, 'price', menus.price, 'description', menus.description)) AS menu,
             * JSON_ARRAYAGG(JSON_OBJECT('id', dishes.id, 'card_id', dishes.card_id, 'name', dishes.name, 'price', dishes.price)) AS dishe
             * FROM deliveries
             * LEFT JOIN users ON users.id = 49
             * LEFT JOIN customers ON customers.user_id = deliveries.customer_id
             * LEFT JOIN restaurants ON restaurants.user_id = deliveries.restaurant_id
             * LEFT JOIN deliverymans ON deliverymans.user_id = deliveries.deliveryman_id
             * LEFT JOIN orders_deliveries ON orders_deliveries.delivery_id = deliveries.id
             * LEFT JOIN menus ON menus.id = orders_deliveries.menu_id
             * LEFT JOIN dishes ON dishes.id = orders_deliveries.dishe_id
             * WHERE deliveries.customer_id = 49 OR deliveries.deliveryman_id = 49 OR deliveries.restaurant_id = 49
             * GROUP BY deliveries.id, deliveries.customer_id, deliveries.deliveryman_id, deliveries.restaurant_id, deliveries.status, deliveries.created_at, restaurants.id, deliverymans.id, customers.id
             */
            deliveries.forEach((deliverie) => {
                deliverie.menu = deliverie.menu.filter((menu) => menu.id !== null);
                deliverie.dishe = deliverie.dishe.filter((dishe) => dishe.id !== null);
                delete deliverie.orders_deliverie;
            });
            if (deliveries.length === 0) {
                return {
                    code: 404,
                    data: null,
                    message: 'Aucune commande trouvée'
                };
            }
            return {
                code: 200,
                data: deliveries,
                message: 'Liste des commandes'
            };
        });
    }
    delete(id) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const deliveryExists = yield this.select(false, 'id')
                .where('id', '=', id)
                .run();
            const deliveryExist = deliveryExists[0];
            if (deliveryExist) {
                yield _super.delete.call(this, id);
                return {
                    code: 200,
                    data: null,
                    message: 'La commande a bien été supprimé'
                };
            }
            else {
                return {
                    code: 404,
                    data: null,
                    message: 'Cette commande n\'existe pas'
                };
            }
        });
    }
    createOrderDelivery(order_1) {
        return __awaiter(this, arguments, void 0, function* (order, menu = null, dishe = null) {
            this.query = `INSERT INTO orders_deliveries (delivery_id, menu_id, dishe_id) VALUES (?, ?, ?)`;
            return yield this.execute(this.query, [order, menu, dishe]);
        });
    }
    checkMenus(menus, restaurant_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!menus) {
                return [];
            }
            return yield this.restaurantService.select(false, 'user_id', 'description', 'address')
                .groupBy('cards.id')
                .selectJoin('cards', false, false, 'id', 'description')
                .join('LEFT JOIN', 'cards', 'restaurants.card_id', 'cards.id')
                .selectJoin('menus', true, false, 'id', 'card_id', 'name', 'price', 'description')
                .join('LEFT JOIN', 'menus', 'menus.card_id', 'cards.id')
                .where('menus.id', 'IN', menus)
                .andWhere('restaurants.user_id', '=', restaurant_id)
                .run();
        });
    }
    checkDishes(dishes, restaurant_id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!dishes) {
                return [];
            }
            return yield this.restaurantService.select(false, 'user_id', 'description', 'address')
                .groupBy('cards.id')
                .selectJoin('cards', false, false, 'id', 'description')
                .join('LEFT JOIN', 'cards', 'restaurants.card_id', 'cards.id')
                .selectJoin('dishes', true, false, 'id', 'card_id', 'name', 'price')
                .join('LEFT JOIN', 'dishes', 'dishes.card_id', 'cards.id')
                .where('dishes.id', 'IN', dishes)
                .andWhere('restaurants.user_id', '=', restaurant_id)
                .run();
        });
    }
}
__decorate([
    (0, Inject_1.default)('DeliverymanService'),
    __metadata("design:type", DeliverymanService_1.default)
], DeliveryService.prototype, "deliverymanService", void 0);
__decorate([
    (0, Inject_1.default)('RestaurantService'),
    __metadata("design:type", RestaurantService_1.default)
], DeliveryService.prototype, "restaurantService", void 0);
__decorate([
    (0, Inject_1.default)('CustomerService'),
    __metadata("design:type", CustomerService_1.default)
], DeliveryService.prototype, "customerService", void 0);
Container_1.default.register('DeliveryService', new DeliveryService());
exports.default = DeliveryService;
//# sourceMappingURL=DeliveryService.js.map