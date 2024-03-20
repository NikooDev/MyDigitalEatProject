import User from '@Entities/User';
import { CustomerType } from '@Src/interfaces/User';

class Customer extends User implements CustomerType {
	public user_id: number;

	public address: string;

	constructor(customer: CustomerType) {
		super(customer.user);

		this.user_id = customer.user_id;
		this.address = customer.address;
	}
}

export default Customer;