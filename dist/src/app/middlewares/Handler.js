"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewaresDeliveries = exports.MiddlewaresMenu = exports.MiddlewaresDishe = exports.MiddlewaresDeliveryman = exports.MiddlewaresRestaurant = exports.MiddlewaresCustomer = void 0;
const User_1 = require("../../interfaces/User");
const Email_1 = __importDefault(require("./Email"));
const Auth_1 = __importDefault(require("./Auth"));
const Validator_1 = __importDefault(require("./Validator"));
/*
|--------------------------------------------------------------------------
| Déclaration des middlewares
|--------------------------------------------------------------------------
*/
const isUniqueEmail = Email_1.default.isUnique.bind(Email_1.default);
const isAuth = Auth_1.default.isAuth.bind(Auth_1.default);
const isCustomer = Auth_1.default.isRole(User_1.RoleEnum.CUSTOMER).bind(Auth_1.default);
const isRestaurant = Auth_1.default.isRole(User_1.RoleEnum.RESTAURANT).bind(Auth_1.default);
const isDeliveryman = Auth_1.default.isRole(User_1.RoleEnum.DELIVERYMAN).bind(Auth_1.default);
const isAll = Auth_1.default.isAll.bind(Auth_1.default);
const isCustomerOrRestaurant = Auth_1.default.isCustomerOrRestaurant.bind(Auth_1.default);
const isValidDatas = Validator_1.default.datas.bind(Validator_1.default);
exports.MiddlewaresCustomer = {
    get: [isAuth, isCustomer],
    post: [isValidDatas, isUniqueEmail],
    put: [isAuth, isCustomer, isValidDatas, isUniqueEmail],
    delete: [isAuth, isCustomer]
};
exports.MiddlewaresRestaurant = {
    get: [isAuth, isAll],
    post: [isValidDatas, isUniqueEmail],
    put: [isAuth, isRestaurant, isValidDatas, isUniqueEmail],
    delete: [isAuth, isRestaurant]
};
exports.MiddlewaresDeliveryman = {
    get: [isAuth, isDeliveryman],
    post: [isValidDatas, isUniqueEmail],
    put: [isAuth, isDeliveryman, isValidDatas, isUniqueEmail],
    delete: [isAuth, isDeliveryman]
};
exports.MiddlewaresDishe = {
    get: [isAuth, isAll],
    post: [isAuth, isRestaurant, isValidDatas],
    put: [isAuth, isRestaurant, isValidDatas],
    delete: [isAuth, isRestaurant]
};
exports.MiddlewaresMenu = {
    get: [isAuth, isAll],
    post: [isAuth, isRestaurant, isValidDatas],
    put: [isAuth, isRestaurant, isValidDatas],
    delete: [isAuth, isRestaurant]
};
exports.MiddlewaresDeliveries = {
    get: [isAuth, isAll],
    post: [isAuth, isCustomer, isValidDatas],
    put: [],
    delete: [isAuth, isCustomerOrRestaurant]
};
//# sourceMappingURL=Handler.js.map