"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuType = exports.menuService = void 0;
const type_1 = require("graphql/type");
const MenuService_1 = __importDefault(require("../../services/MenuService"));
exports.menuService = new MenuService_1.default();
exports.MenuType = new type_1.GraphQLObjectType({
    name: 'Menu',
    fields: {
        id: { type: type_1.GraphQLID },
        card_id: { type: type_1.GraphQLID },
        restaurant_id: { type: type_1.GraphQLID },
        name: { type: type_1.GraphQLString },
        price: { type: type_1.GraphQLInt },
        description: { type: type_1.GraphQLString },
    }
});
//# sourceMappingURL=menu.js.map