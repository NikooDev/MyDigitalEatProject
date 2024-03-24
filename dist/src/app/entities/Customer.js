"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
class Customer extends User_1.default {
    constructor(customer) {
        super(customer.user);
        this.id = customer.id;
        this.user_id = customer.user_id;
        this.address = customer.address;
    }
}
exports.default = Customer;
//# sourceMappingURL=Customer.js.map