"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisheType = exports.disheService = void 0;
const type_1 = require("graphql/type");
const DisheService_1 = __importDefault(require("../../services/DisheService"));
exports.disheService = new DisheService_1.default();
exports.DisheType = new type_1.GraphQLObjectType({
    name: 'Dishe',
    fields: {
        id: { type: type_1.GraphQLID },
        card_id: { type: type_1.GraphQLID },
        restaurant_id: { type: type_1.GraphQLID },
        name: { type: type_1.GraphQLString },
        price: { type: type_1.GraphQLInt }
    }
});
//# sourceMappingURL=dishe.js.map