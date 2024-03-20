export enum DeliveryEnum {
	PENDING = 'PENDING',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED'
}

interface DeliveryType {
	customer_id: number
	deliveryman_id: number
	restaurant_id: number
	status: DeliveryEnum
	created_at: Date
}

export default DeliveryType;