"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("./User"));
class Restaurant extends User_1.default {
    constructor(restaurant) {
        super(restaurant.user);
        this.id = restaurant.id;
        this.user_id = restaurant.user_id;
        this.card_id = restaurant.card_id;
        this.address = restaurant.address;
        this.description = restaurant.description;
    }
}
exports.default = Restaurant;
//# sourceMappingURL=Restaurant.js.map