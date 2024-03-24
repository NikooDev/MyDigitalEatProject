"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserType = exports.userService = void 0;
const type_1 = require("graphql/type");
const UserService_1 = __importDefault(require("../../services/UserService"));
exports.userService = new UserService_1.default();
exports.UserType = new type_1.GraphQLObjectType({
    name: 'UserType',
    fields: {
        id: { type: type_1.GraphQLID },
        name: { type: type_1.GraphQLString },
        role: { type: type_1.GraphQLString },
        email: { type: type_1.GraphQLString },
        phone: { type: type_1.GraphQLString },
        created_at: { type: type_1.GraphQLString },
        updated_at: { type: type_1.GraphQLString }
    }
});
//# sourceMappingURL=users.js.map