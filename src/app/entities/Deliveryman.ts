import User from '@Entities/User';
import { DeliverymanType, StatusEnum } from '@Src/interfaces/User';

class Deliveryman extends User implements DeliverymanType {
	public user_id: number;

	public status: StatusEnum;

	constructor(deliveryman: DeliverymanType) {
		super(deliveryman.user);

		this.user_id = deliveryman.user_id;
		this.status = deliveryman.status;
	}
}

export default Deliveryman;