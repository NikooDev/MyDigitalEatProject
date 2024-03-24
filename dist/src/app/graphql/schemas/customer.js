"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerType = exports.CustomerDeliveries = exports.customerService = void 0;
const type_1 = require("graphql/type");
const deliveries_1 = require("../../graphql/schemas/deliveries");
const users_1 = require("../../graphql/schemas/users");
const menu_1 = require("../../graphql/schemas/menu");
const dishe_1 = require("../../graphql/schemas/dishe");
const restaurant_1 = require("../../graphql/schemas/restaurant");
const deliveryman_1 = require("../../graphql/schemas/deliveryman");
const CustomerService_1 = __importDefault(require("../../services/CustomerService"));
exports.customerService = new CustomerService_1.default();
exports.CustomerDeliveries = new type_1.GraphQLObjectType({
    name: 'CustomerDeliveries',
    description: 'Type representing a delivery',
    fields: {
        user_id: { type: type_1.GraphQLID },
        address: { type: type_1.GraphQLString },
        deliverie: { type: deliveries_1.DeliveriesType },
        restaurant: { type: restaurant_1.RestaurantType },
        deliveryman: { type: deliveryman_1.DeliverymanType },
        menu: { type: new type_1.GraphQLList(menu_1.MenuType) },
        dishe: { type: new type_1.GraphQLList(dishe_1.DisheType) }
    }
});
exports.CustomerType = new type_1.GraphQLObjectType({
    name: 'Customer',
    fields: {
        user_id: { type: type_1.GraphQLID },
        address: { type: type_1.GraphQLString },
        user: {
            type: users_1.UserType
        },
        deliveries: {
            type: new type_1.GraphQLList(exports.CustomerDeliveries)
        }
    }
});
//# sourceMappingURL=customer.js.map