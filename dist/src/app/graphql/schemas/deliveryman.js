"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliverymanType = exports.DeliverymanDeliveries = exports.deliverymanService = void 0;
const type_1 = require("graphql/type");
const DeliverymanService_1 = __importDefault(require("../../services/DeliverymanService"));
const deliveries_1 = require("../../graphql/schemas/deliveries");
const restaurant_1 = require("../../graphql/schemas/restaurant");
const menu_1 = require("../../graphql/schemas/menu");
const dishe_1 = require("../../graphql/schemas/dishe");
const users_1 = require("../../graphql/schemas/users");
const customer_1 = require("../../graphql/schemas/customer");
exports.deliverymanService = new DeliverymanService_1.default();
exports.DeliverymanDeliveries = new type_1.GraphQLObjectType({
    name: 'DeliverymanDeliveries',
    description: 'Type representing a delivery',
    fields: () => ({
        user_id: { type: type_1.GraphQLID },
        status: { type: type_1.GraphQLString },
        address: { type: type_1.GraphQLString },
        deliverie: {
            type: deliveries_1.DeliveriesType
        },
        customer: {
            type: customer_1.CustomerType
        },
        restaurant: {
            type: restaurant_1.RestaurantType
        },
        menu: {
            type: new type_1.GraphQLList(menu_1.MenuType)
        },
        dishe: {
            type: new type_1.GraphQLList(dishe_1.DisheType)
        }
    })
});
exports.DeliverymanType = new type_1.GraphQLObjectType({
    name: 'DeliverymanType',
    fields: {
        user_id: { type: type_1.GraphQLID },
        status: { type: type_1.GraphQLString },
        address: { type: type_1.GraphQLString },
        user: {
            type: users_1.UserType
        },
        deliveries: {
            type: new type_1.GraphQLList(exports.DeliverymanDeliveries)
        }
    }
});
//# sourceMappingURL=deliveryman.js.map