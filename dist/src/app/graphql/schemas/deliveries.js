"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveriesType = exports.deliveryService = void 0;
const type_1 = require("graphql/type");
const DeliveryService_1 = __importDefault(require("../../services/DeliveryService"));
const users_1 = require("../../graphql/schemas/users");
const customer_1 = require("../../graphql/schemas/customer");
const restaurant_1 = require("../../graphql/schemas/restaurant");
const deliveryman_1 = require("../../graphql/schemas/deliveryman");
const menu_1 = require("../../graphql/schemas/menu");
const dishe_1 = require("../../graphql/schemas/dishe");
exports.deliveryService = new DeliveryService_1.default();
const DeliveryEnumType = new type_1.GraphQLEnumType({
    name: 'DeliveryStatus',
    description: 'Enumeration representing delivery status',
    values: {
        PENDING: { value: 'PENDING' },
        DELIVERED: { value: 'DELIVERED' },
        CANCELLED: { value: 'CANCELLED' }
    }
});
exports.DeliveriesType = new type_1.GraphQLObjectType({
    name: 'DeliveryType',
    description: 'Type representing a delivery',
    fields: () => ({
        id: { type: type_1.GraphQLID },
        customer_id: { type: type_1.GraphQLID },
        deliveryman_id: { type: type_1.GraphQLID },
        restaurant_id: { type: type_1.GraphQLID },
        status: { type: DeliveryEnumType },
        created_at: { type: type_1.GraphQLString },
        user: {
            type: users_1.UserType
        },
        customer: {
            type: customer_1.CustomerType
        },
        restaurant: {
            type: restaurant_1.RestaurantType
        },
        deliveryman: {
            type: deliveryman_1.DeliverymanType
        },
        menu: {
            type: new type_1.GraphQLList(menu_1.MenuType)
        },
        dishe: {
            type: new type_1.GraphQLList(dishe_1.DisheType)
        }
    })
});
//# sourceMappingURL=deliveries.js.map