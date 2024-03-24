"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const type_1 = require("graphql/type");
const login_1 = require("../../graphql/schemas/login");
const customer_1 = require("../../graphql/schemas/customer");
const users_1 = require("../../graphql/schemas/users");
const restaurant_1 = require("../../graphql/schemas/restaurant");
const deliveries_1 = require("../../graphql/schemas/deliveries");
const dishe_1 = require("../../graphql/schemas/dishe");
const menu_1 = require("../../graphql/schemas/menu");
const deliveryman_1 = require("../../graphql/schemas/deliveryman");
const User_1 = require("../../../interfaces/User");
const RootQuery = new type_1.GraphQLObjectType({
    name: 'Query',
    fields: {
        getCustomer: {
            type: customer_1.CustomerType,
            resolve: (parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (context.dataloaders.user && (context.dataloaders.user.role !== User_1.RoleEnum.CUSTOMER)) {
                    return null;
                }
                const res = yield customer_1.customerService.read(context.dataloaders.user);
                if (!res.data) {
                    return null;
                }
                return res.data;
            })
        },
        getRestaurants: {
            type: new type_1.GraphQLList(restaurant_1.RestaurantType),
            resolve: () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield restaurant_1.restaurantService.read();
                return res.data;
            })
        },
        getDeliveryman: {
            type: deliveryman_1.DeliverymanType,
            resolve: (parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (context.dataloaders.user && (context.dataloaders.user.role !== User_1.RoleEnum.DELIVERYMAN)) {
                    return null;
                }
                else {
                    const res = yield deliveryman_1.deliverymanService.read(context.dataloaders.user);
                    if (res.code === 403 || !res.data) {
                        return null;
                    }
                    return res.data;
                }
            })
        },
        getDeliveries: {
            type: new type_1.GraphQLList(deliveries_1.DeliveriesType),
            resolve: (parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
                if (!context.dataloaders.user) {
                    return null;
                }
                const res = yield deliveries_1.deliveryService.read(context.dataloaders.user);
                if (!res.data) {
                    return null;
                }
                return res.data;
            })
        },
        getDishes: {
            type: new type_1.GraphQLList(dishe_1.DisheType),
            resolve: () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield dishe_1.disheService.read();
                if (!res.data) {
                    return null;
                }
                return res.data;
            })
        },
        getMenus: {
            type: new type_1.GraphQLList(menu_1.MenuType),
            resolve: () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield menu_1.menuService.read();
                if (!res.data) {
                    return null;
                }
                return res.data;
            })
        }
    }
});
const RootMutation = new type_1.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        login: {
            type: login_1.LoginResponseType,
            args: {
                email: { type: new type_1.GraphQLNonNull(type_1.GraphQLString) },
                password: { type: new type_1.GraphQLNonNull(type_1.GraphQLString) }
            },
            resolve: (parent, args, context) => __awaiter(void 0, void 0, void 0, function* () {
                const auth = yield users_1.userService.login(args.email, args.password);
                // On ajoute l'utilisateur dans le context de GraphQL grâce à dataloaders
                context.dataloaders.user = auth.user;
                return auth;
            })
        }
    }
});
const Schema = new type_1.GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation
});
exports.default = Schema;
//# sourceMappingURL=index.js.map