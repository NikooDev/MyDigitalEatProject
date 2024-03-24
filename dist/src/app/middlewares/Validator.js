"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Schemas_1 = __importDefault(require("../validators/Schemas"));
const handler_1 = __importDefault(require("../../core/response/handler"));
/**
 * @Class Validator
 * @description Validation générique des données de toutes les routes
 */
class Validator {
    datas(req, res, next) {
        var _a;
        const route = req.path;
        const method = req.method;
        if (method !== 'POST' && method !== 'PUT') {
            return next();
        }
        const params = req.path.split('/')[2];
        const paramsRoute = req.path.split('/')[1];
        const schema = params ? (_a = Schemas_1.default[`/${paramsRoute}/{id}`]) === null || _a === void 0 ? void 0 : _a[method] : Schemas_1.default[route][method];
        if (!schema) {
            return next();
        }
        const { error } = schema.validate(req.body);
        if (error) {
            return handler_1.default.exception(res, error.details[0].message, 422, null);
        }
        return next();
    }
}
exports.default = new Validator();
//# sourceMappingURL=Validator.js.map