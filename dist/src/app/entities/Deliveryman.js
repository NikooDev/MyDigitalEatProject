"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
class Deliveryman extends User_1.default {
    constructor(deliveryman) {
        super(deliveryman.user);
        this.id = deliveryman.id;
        this.user_id = deliveryman.user_id;
        this.status = deliveryman.status;
        this.address = deliveryman.address;
    }
}
exports.default = Deliveryman;
//# sourceMappingURL=Deliveryman.js.map