"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Inject_1 = __importDefault(require("../../core/service/Inject"));
const errors_1 = require("../../core/constants/errors");
const handler_1 = __importDefault(require("../../core/response/handler"));
const CustomerService_1 = __importDefault(require("../services/CustomerService"));
const UserService_1 = __importDefault(require("../services/UserService"));
class CustomerController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            yield handler_1.default.tryCatch(res, errors_1.customerController.create, () => __awaiter(this, void 0, void 0, function* () {
                const customer = yield this.customerService.create(data);
                return (handler_1.default[customer.code === 200 ? 'success' : 'exception'])(res, customer.message, customer.code, { customer: customer.data });
            }));
        });
    }
    read(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            yield handler_1.default.tryCatch(res, errors_1.customerController.read, () => __awaiter(this, void 0, void 0, function* () {
                const customers = yield this.customerService.read(user);
                return (handler_1.default[customers.code === 200 ? 'success' : 'exception'])(res, customers.message, customers.code, { customers: customers.data });
            }));
        });
    }
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            const params = req.params;
            yield handler_1.default.tryCatch(res, errors_1.customerController.update, () => __awaiter(this, void 0, void 0, function* () {
                const customer = yield this.customerService.update(data, params.id);
                return (handler_1.default[customer.code === 200 ? 'success' : 'exception'])(res, customer.message, customer.code, { customer: customer.data });
            }));
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = req.params;
            yield handler_1.default.tryCatch(res, errors_1.customerController.delete, () => __awaiter(this, void 0, void 0, function* () {
                const customer = yield this.userService.delete(params.id);
                return (handler_1.default[customer.code === 200 ? 'success' : 'exception'])(res, customer.message, customer.code);
            }));
        });
    }
}
__decorate([
    (0, Inject_1.default)('CustomerService'),
    __metadata("design:type", CustomerService_1.default)
], CustomerController.prototype, "customerService", void 0);
__decorate([
    (0, Inject_1.default)('UserService'),
    __metadata("design:type", UserService_1.default)
], CustomerController.prototype, "userService", void 0);
exports.default = new CustomerController();
//# sourceMappingURL=CustomerController.js.map