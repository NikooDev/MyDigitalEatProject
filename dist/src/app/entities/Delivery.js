"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Delivery {
    constructor(delivery) {
        this.id = delivery.id;
        this.customer_id = delivery.customer_id;
        this.deliveryman_id = delivery.deliveryman_id;
        this.restaurant_id = delivery.restaurant_id;
        this.status = delivery.status;
        this.created_at = delivery.created_at;
    }
}
exports.default = Delivery;
//# sourceMappingURL=Delivery.js.map