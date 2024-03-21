import User from '@Entities/User';
import { DeliverymanType, StatusEnum } from '@Src/interfaces/User';

class Deliveryman extends User implements DeliverymanType {
	public id: number;

	public user_id: number;

	public status: StatusEnum;

	public address: string;

	constructor(deliveryman: DeliverymanType) {
		super(deliveryman.user);

		this.id = deliveryman.id;
		this.user_id = deliveryman.user_id;
		this.status = deliveryman.status;
		this.address = deliveryman.address;
	}
}

export default Deliveryman;