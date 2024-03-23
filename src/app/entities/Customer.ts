import User from '@Entities/User';
import { CustomerType } from '@Src/interfaces/User';
import DeliveryType from '@Src/interfaces/Delivery';

class Customer extends User implements CustomerType {
	public id: number;

	public user_id: number;

	public address: string;

	constructor(customer: CustomerType) {
		super(customer.user);

		this.id = customer.id;
		this.user_id = customer.user_id;
		this.address = customer.address;
	}
}

export default Customer;