"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantType = exports.restaurantService = void 0;
const type_1 = require("graphql/type");
const menu_1 = require("../../graphql/schemas/menu");
const dishe_1 = require("../../graphql/schemas/dishe");
const RestaurantService_1 = __importDefault(require("../../services/RestaurantService"));
exports.restaurantService = new RestaurantService_1.default();
exports.RestaurantType = new type_1.GraphQLObjectType({
    name: 'Restaurant',
    fields: {
        user_id: { type: type_1.GraphQLID },
        card_id: { type: type_1.GraphQLID },
        description: { type: type_1.GraphQLString },
        address: { type: type_1.GraphQLString },
        menu: {
            type: new type_1.GraphQLList(menu_1.MenuType)
        },
        dishe: {
            type: new type_1.GraphQLList(dishe_1.DisheType)
        }
    }
});
//# sourceMappingURL=restaurant.js.map