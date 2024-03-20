import User from '@Entities/User';
import { RestaurantType } from '@Src/interfaces/User';

class Restaurant extends User implements RestaurantType {
	public user_id: number;

	public card_id: number;

	public description: string;

	constructor(restaurant: RestaurantType) {
		super(restaurant.user);

		this.user_id = restaurant.user_id;
		this.card_id = restaurant.card_id;
		this.description = restaurant.description;
	}
}

export default Restaurant;