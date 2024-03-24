"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginResponseType = void 0;
const type_1 = require("graphql/type");
const users_1 = require("../../graphql/schemas/users");
const LoginResponseType = new type_1.GraphQLObjectType({
    name: 'LoginResponse',
    fields: {
        user: {
            type: users_1.UserType
        },
        token: { type: type_1.GraphQLString },
        message: { type: type_1.GraphQLString }
    }
});
exports.LoginResponseType = LoginResponseType;
//# sourceMappingURL=login.js.map