import DeliveryType, { DeliveryEnum } from '@Src/interfaces/Delivery';

class Delivery implements DeliveryType {
	public id: number;

	/**
	 * @relation ManyToOne
	 * @param customer_id
	 */
	public customer_id: number;

	/**
	 * @relation ManyToOne
	 * @param deliveryman_id
	 */
	public deliveryman_id: number;

	/**
	 * @relation ManyToOne
	 * @param restaurant_id
	 */
	public restaurant_id: number;

	public status: DeliveryEnum;

	public created_at: Date;

	constructor(delivery: DeliveryType) {
		this.id = delivery.id;
		this.customer_id = delivery.customer_id;
		this.deliveryman_id = delivery.deliveryman_id;
		this.restaurant_id = delivery.restaurant_id;
		this.status = delivery.status;
		this.created_at = delivery.created_at;
	}
}

export default Delivery;