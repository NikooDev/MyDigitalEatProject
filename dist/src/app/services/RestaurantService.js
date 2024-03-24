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
const handler_1 = __importDefault(require("../../core/response/handler"));
const Restaurant_1 = __importDefault(require("../entities/Restaurant"));
const UserService_1 = __importDefault(require("./UserService"));
const Inject_1 = __importDefault(require("../../core/service/Inject"));
const CardService_1 = __importDefault(require("./CardService"));
class RestaurantService extends DaoService_1.default {
    constructor() {
        super('restaurants');
    }
    create(entity) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            let newRestaurant = new Restaurant_1.default({
                user: {
                    email: entity.email.toLowerCase(),
                    password: entity.password,
                    name: entity.name,
                    phone: entity.phone,
                    role: User_1.RoleEnum.RESTAURANT,
                    created_at: new Date(),
                    updated_at: new Date(),
                },
                user_id: null,
                card_id: null,
                address: entity.address,
                description: entity.description
            });
            yield newRestaurant.hashPassword(entity.password);
            const lastInsertId = yield this.userService.create(newRestaurant.user);
            if (lastInsertId) {
                newRestaurant = new Restaurant_1.default(Object.assign(Object.assign({}, newRestaurant), { user_id: lastInsertId }));
                const { user, id } = newRestaurant, customer = __rest(newRestaurant, ["user", "id"]);
                newRestaurant.user = Object.assign({ id: lastInsertId }, newRestaurant.user);
                yield _super.create.call(this, customer);
                delete newRestaurant.user.password;
                return {
                    code: 200,
                    data: newRestaurant,
                    message: 'Votre compte restaurant a bien été créé'
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
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const restaurants = yield this.select(false, 'user_id', 'card_id', 'address', 'description')
                .selectJoin('menus', false, true, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
                .join('INNER JOIN', 'menus', 'menus.restaurant_id', 'restaurants.user_id')
                .selectJoin('dishes', false, true, 'id', 'card_id', 'restaurant_id', 'name', 'price')
                .join('INNER JOIN', 'dishes', 'dishes.restaurant_id', 'restaurants.user_id')
                .run();
            restaurants.forEach(restaurant => {
                restaurant.menu = JSON.parse(restaurant.menu);
                restaurant.dishe = JSON.parse(restaurant.dishe);
                return restaurant;
            });
            if (restaurants.length === 0) {
                return {
                    code: 404,
                    data: null,
                    message: 'Aucun restaurant trouvé'
                };
            }
            return {
                code: 200,
                data: restaurants,
                message: `Liste des restaurants - ${restaurants.length} restaurants trouvés`
            };
        });
    }
    update(entity, id) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            // Est-ce que le restaurant existe ?
            const restaurantExists = yield this.select(false, 'id', 'user_id', 'card_id', 'address', 'description')
                .selectJoin('users', false, false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
                .join('INNER JOIN', 'users', 'users.id', 'restaurants.user_id')
                .where('restaurants.user_id', '=', id)
                .run();
            const restaurantExist = restaurantExists[0];
            if (restaurantExist) {
                let updateRestaurant = new Restaurant_1.default({
                    id: restaurantExist.id,
                    user_id: restaurantExist.user_id,
                    card_id: restaurantExist.card_id,
                    address: (_a = entity.address) !== null && _a !== void 0 ? _a : restaurantExist.address,
                    description: (_b = entity.description) !== null && _b !== void 0 ? _b : restaurantExist.description,
                    user: {
                        id: restaurantExist.user.id,
                        email: (_c = entity.email) !== null && _c !== void 0 ? _c : restaurantExist.user.email.toLowerCase(),
                        password: entity.password,
                        name: (_d = entity.name) !== null && _d !== void 0 ? _d : restaurantExist.user.name,
                        phone: (_e = entity.phone) !== null && _e !== void 0 ? _e : restaurantExist.user.phone,
                        role: restaurantExist.user.role,
                        created_at: restaurantExist.user.created_at,
                        updated_at: new Date(),
                    }
                });
                if (entity.password) {
                    yield updateRestaurant.hashPassword(entity.password);
                }
                yield this.userService.update(updateRestaurant.user, restaurantExist.user_id);
                const { user } = updateRestaurant, restaurant = __rest(updateRestaurant, ["user"]);
                // Si on modifie ou ajoute une carte, on vérifie si elle existe déjà
                if (entity.card && entity.card.description.length > 0) {
                    const restaurantCardExists = yield this.select(false, 'card_id')
                        .selectJoin('cards', false, false, 'id')
                        .join('INNER JOIN', 'cards', 'cards.id', 'restaurants.card_id')
                        .where('restaurants.user_id', '=', restaurantExist.user_id)
                        .run();
                    const restaurantCardExist = restaurantCardExists[0];
                    if (!restaurantCardExist) {
                        restaurant.card_id = yield this.cardService.create(entity.card);
                        yield _super.update.call(this, { card_id: restaurant.card_id }, restaurantExist.id);
                    }
                    else {
                        yield this.cardService.update(entity.card, restaurantCardExist.card_id);
                    }
                }
                let card = { id: null, description: null };
                // On récupère la carte du restaurant
                const restaurantCardExists = yield this.select(false, 'card_id')
                    .selectJoin('cards', false, false, 'id', 'description')
                    .join('INNER JOIN', 'cards', 'cards.id', 'restaurants.card_id')
                    .where('restaurants.user_id', '=', restaurantExist.user_id)
                    .run();
                const restaurantCardExist = restaurantCardExists[0];
                if (restaurantCardExist) {
                    card.id = restaurantCardExist.card_id;
                    card.description = restaurantCardExist.card.description;
                }
                yield _super.update.call(this, restaurant, restaurantExist.id);
                delete updateRestaurant.user.password;
                delete updateRestaurant.id;
                return {
                    code: 200,
                    data: Object.assign(Object.assign({}, updateRestaurant), { card: (card.id && card.description) ? card : null }),
                    message: 'Votre compte restaurant a bien été modifié'
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
], RestaurantService.prototype, "userService", void 0);
__decorate([
    (0, Inject_1.default)('CardService'),
    __metadata("design:type", CardService_1.default)
], RestaurantService.prototype, "cardService", void 0);
Container_1.default.register('RestaurantService', new RestaurantService());
exports.default = RestaurantService;
//# sourceMappingURL=RestaurantService.js.map