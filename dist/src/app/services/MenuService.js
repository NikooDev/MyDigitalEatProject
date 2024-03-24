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
const Inject_1 = __importDefault(require("../../core/service/Inject"));
const DaoService_1 = __importDefault(require("./DaoService"));
const Container_1 = __importDefault(require("../../core/service/Container"));
const Menu_1 = __importDefault(require("../entities/Menu"));
const handler_1 = __importDefault(require("../../core/response/handler"));
const RestaurantService_1 = __importDefault(require("./RestaurantService"));
const DisheService_1 = __importDefault(require("./DisheService"));
class MenuService extends DaoService_1.default {
    constructor() {
        super('menus');
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
            // Vérifier si le restaurant existe
            const restaurantExists = yield this.restaurantService.all()
                .where('user_id', '=', user.id)
                .run();
            const restaurantExist = restaurantExists[0];
            if (!restaurantExist.card_id) {
                return {
                    code: 404,
                    message: `Votre restaurant ne possède pas de carte. Vous pouvez en créer une en modifiant votre restaurant.`,
                    data: null
                };
            }
            // Création du menu
            let newMenu = new Menu_1.default({
                card_id: restaurantExist.card_id,
                restaurant_id: restaurantExist.user_id,
                name: entity.name,
                price: entity.price,
                description: entity.description,
                dishes: entity.dishes
            });
            const { dishes, id } = newMenu, menu = __rest(newMenu, ["dishes", "id"]);
            yield _super.create.call(this, menu);
            // Récupération de l'identifiant du menu
            const lastInsertId = yield this.select(true, 'LAST_INSERT_ID() AS id')
                .limit(1)
                .run();
            if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
                newMenu.id = lastInsertId[0].id;
            }
            else {
                handler_1.default.logger('Échec de la récupération du dernier identifiant du menu', 'error');
                return {
                    code: 500,
                    data: null,
                    message: 'Une erreur interne est survenue'
                };
            }
            // Création des plats du menu
            const disheService = new DisheService_1.default();
            for (let i = 0; i < entity.dishes.length; i++) {
                const dishe = entity.dishes[i];
                const newDishe = {
                    card_id: restaurantExist.card_id,
                    restaurant_id: restaurantExist.user_id,
                    name: dishe.name,
                    price: dishe.price
                };
                const lastInsertId = yield disheService.create(newDishe, user);
                if (!lastInsertId.data) {
                    handler_1.default.logger('Échec de la récupération du dernier identifiant du plat', 'error');
                    return {
                        code: 500,
                        data: null,
                        message: 'Une erreur interne est survenue'
                    };
                }
                // Création de la relation entre le menu et le plat
                yield this.createMenuDishe(newMenu.id, lastInsertId.data.id);
            }
            return {
                code: 200,
                message: `Le menu ${newMenu.name.toUpperCase()} a bien été créé`,
                data: newMenu
            };
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const allMenus = yield this.select(false, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
                .selectJoin('menus_dishes', true, false, 'menu_id', 'dishe_id')
                .join('INNER JOIN', 'menus_dishes', 'menus.id', 'menus_dishes.menu_id')
                .selectJoin('dishes', true, false, 'id', 'name', 'price')
                .join('INNER JOIN', 'dishes', 'menus_dishes.dishe_id', 'dishes.id')
                .run();
            if (allMenus.length === 0) {
                return {
                    code: 404,
                    message: 'Aucun menu trouvé',
                    data: []
                };
            }
            const menus = allMenus.map((menu) => {
                const menuWithoutMenusDishes = Object.assign({}, menu);
                delete menuWithoutMenusDishes.menus_dishe;
                return menuWithoutMenusDishes;
            });
            return {
                code: 200,
                message: `Liste des menus - ${menus.length} résultats`,
                data: menus
            };
        });
    }
    update(entity, id) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const menuExists = yield this.select(false, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
                .where('menus.id', '=', id)
                .run();
            const menuExist = menuExists[0];
            if (!menuExist) {
                return {
                    code: 404,
                    data: null,
                    message: 'Ce menu n\'existe pas'
                };
            }
            const updateMenu = new Menu_1.default({
                id: menuExist.id,
                card_id: menuExist.card_id,
                restaurant_id: menuExist.restaurant_id,
                name: (_a = entity.name) !== null && _a !== void 0 ? _a : menuExist.name,
                price: (_b = entity.price) !== null && _b !== void 0 ? _b : menuExist.price,
                description: (_c = entity.description) !== null && _c !== void 0 ? _c : menuExist.description
            });
            yield _super.update.call(this, updateMenu, id);
            return {
                code: 200,
                data: updateMenu,
                message: 'Le menu a bien été modifié'
            };
        });
    }
    delete(id) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const menuExists = yield this.select(false, 'id')
                .where('id', '=', id)
                .run();
            const menuExist = menuExists[0];
            if (menuExist) {
                yield _super.delete.call(this, id);
                return {
                    code: 200,
                    data: null,
                    message: 'Le menu a bien été supprimé'
                };
            }
            else {
                return {
                    code: 404,
                    data: null,
                    message: 'Ce menu n\'existe pas'
                };
            }
        });
    }
    createMenuDishe(menuId, disheId) {
        return __awaiter(this, void 0, void 0, function* () {
            this.query = `INSERT INTO menus_dishes (menu_id, dishe_id)
                  VALUES (?, ?)`;
            return yield this.execute(this.query, [menuId, disheId]);
        });
    }
}
__decorate([
    (0, Inject_1.default)('RestaurantService'),
    __metadata("design:type", RestaurantService_1.default)
], MenuService.prototype, "restaurantService", void 0);
Container_1.default.register('MenuService', new MenuService());
exports.default = MenuService;
//# sourceMappingURL=MenuService.js.map