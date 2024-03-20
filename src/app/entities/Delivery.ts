import DeliveryType, { DeliveryEnum } from '@Src/interfaces/Delivery';

class Delivery implements DeliveryType {
	public customer_id: number;

	public deliveryman_id: number;

	public restaurant_id: number;

	public status: DeliveryEnum;

	public created_at: Date;

	constructor(delivery: DeliveryType) {
		this.customer_id = delivery.customer_id;
		this.deliveryman_id = delivery.deliveryman_id;
		this.restaurant_id = delivery.restaurant_id;
		this.status = delivery.status;
		this.created_at = delivery.created_at;
	}
}

export default Delivery;