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
const Dishe_1 = __importDefault(require("../entities/Dishe"));
const handler_1 = __importDefault(require("../../core/response/handler"));
const RestaurantService_1 = __importDefault(require("./RestaurantService"));
const MenuService_1 = __importDefault(require("./MenuService"));
class DisheService extends DaoService_1.default {
    constructor() {
        super('dishes');
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
            let newDishe = new Dishe_1.default({
                card_id: restaurantExist.card_id,
                restaurant_id: restaurantExist.user_id,
                name: entity.name,
                price: entity.price
            });
            const { id } = newDishe, dishe = __rest(newDishe, ["id"]);
            yield _super.create.call(this, dishe);
            const lastInsertId = yield this.select(true, 'LAST_INSERT_ID() AS id')
                .limit(1)
                .run();
            if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
                newDishe.id = lastInsertId[0].id;
            }
            else {
                handler_1.default.logger('Échec de la récupération du dernier identifiant du plat', 'error');
                return {
                    code: 500,
                    data: null,
                    message: 'Une erreur interne est survenue'
                };
            }
            // Rattacher le plat à un menu
            if (entity.menu_id) {
                /**
                 * Pour éviter les dépendances cycliques,
                 * j'instancie le service MenuService à l'intérieur de la méthode create
                 */
                const menuService = new MenuService_1.default();
                const menuExists = yield menuService.select(false, 'id', 'name')
                    .where('id', '=', entity.menu_id)
                    .run();
                const menuExist = menuExists[0];
                if (!menuExist) {
                    return {
                        code: 404,
                        message: `Le menu id=${entity.menu_id.toString()} n'existe pas`,
                        data: null
                    };
                }
                const menuDishe = {
                    menu_id: menuExist.id,
                    dishe_id: newDishe.id
                };
                yield menuService.createMenuDishe(menuDishe.menu_id, menuDishe.dishe_id);
                return {
                    data: newDishe,
                    code: 200,
                    message: `Le plat ${newDishe.name.toUpperCase()} a bien été créé dans le menu ${menuExist.name.toUpperCase()}`
                };
            }
            return {
                data: newDishe,
                code: 200,
                message: `Le plat ${newDishe.name.toUpperCase()} a bien été créé`
            };
        });
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            const dishes = yield this.all().run();
            if (!dishes) {
                return {
                    code: 404,
                    data: null,
                    message: 'Aucun plat trouvé'
                };
            }
            return {
                code: 200,
                data: dishes,
                message: `Liste des plats - ${dishes.length} résultats`
            };
        });
    }
    update(entity, id) {
        const _super = Object.create(null, {
            update: { get: () => super.update }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const disheExists = yield this.select(false, 'id', 'card_id', 'restaurant_id', 'name', 'price')
                .where('id', '=', id)
                .run();
            const disheExist = disheExists[0];
            if (!disheExist) {
                return {
                    code: 404,
                    data: null,
                    message: 'Ce plat n\'existe pas'
                };
            }
            let newDishe = new Dishe_1.default({
                card_id: disheExist.card_id,
                restaurant_id: disheExist.restaurant_id,
                name: entity.name,
                price: entity.price
            });
            yield _super.update.call(this, newDishe, id);
            // Réassigner un plat à un menu appartenant au restaurant connecté
            if (entity.menu_id) {
                const menuService = new MenuService_1.default();
                const menuExists = yield menuService.select(false, 'id', 'name')
                    .where('id', '=', entity.menu_id)
                    .andWhere('restaurant_id', '=', disheExist.restaurant_id)
                    .run();
                const menuExist = menuExists[0];
                if (!menuExist) {
                    return {
                        code: 404,
                        message: `Le menu id=${entity.menu_id.toString()} n'existe pas ou ne vous appartient pas`,
                        data: null
                    };
                }
                const menuDishe = {
                    menu_id: menuExist.id,
                    dishe_id: disheExist.id
                };
                yield menuService.createMenuDishe(menuDishe.menu_id, menuDishe.dishe_id);
                return {
                    code: 200,
                    data: disheExist,
                    message: `Le plat ${disheExist.name.toUpperCase()} a bien été modifié dans le menu ${menuExist.name.toUpperCase()}`
                };
            }
            return {
                code: 200,
                data: disheExist,
                message: 'Le plat a bien été modifié'
            };
        });
    }
    delete(id) {
        const _super = Object.create(null, {
            delete: { get: () => super.delete }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const disheExists = yield this.select(false, 'id')
                .where('id', '=', id)
                .run();
            const disheExist = disheExists[0];
            if (disheExist) {
                yield _super.delete.call(this, id);
                return {
                    code: 200,
                    data: null,
                    message: 'Le plat a bien été supprimé'
                };
            }
            else {
                return {
                    code: 404,
                    data: null,
                    message: 'Ce plat n\'existe pas'
                };
            }
        });
    }
}
__decorate([
    (0, Inject_1.default)('RestaurantService'),
    __metadata("design:type", RestaurantService_1.default)
], DisheService.prototype, "restaurantService", void 0);
Container_1.default.register('DisheService', new DisheService());
exports.default = DisheService;
//# sourceMappingURL=DisheService.js.map