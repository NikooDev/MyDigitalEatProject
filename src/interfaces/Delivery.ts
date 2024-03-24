import MenuType from '@Src/interfaces/Menu';
import DisheType from '@Src/interfaces/Dishe';

export enum DeliveryEnum {
	PENDING = 'PENDING',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED'
}

interface DeliveryType {
	id?: number
	customer_id: number
	deliveryman_id: number
	restaurant_id: number
	status: DeliveryEnum
	created_at: Date
	menu?: MenuType[]
	dishe?: DisheType[]
	orders_deliverie?: {
		menu_id?: number
		dishe_id?: number
	}
}

export default DeliveryType;