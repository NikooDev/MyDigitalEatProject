import { RestaurantType, RoleEnum, UserType } from '@Src/interfaces/User';
import ResponseType from '@Src/interfaces/Response';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';
import Handler from '@Core/response/handler';
import Restaurant from '@Entities/Restaurant';
import UserService from '@Services/UserService';
import Inject from '@Core/service/Inject';
import CardService from '@Services/CardService';
import CardType from '@Src/interfaces/Card';

class RestaurantService extends DaoService<RestaurantType> {
	@Inject('UserService')
	private userService: UserService;

	@Inject('CardService')
	private cardService: CardService;

	constructor() {
		super('restaurants');
	}

	public async create(entity: RestaurantType & UserType): Promise<ResponseType<RestaurantType>> {
		let newRestaurant = new Restaurant({
			user: {
				email: entity.email.toLowerCase(),
				password: entity.password,
				name: entity.name,
				phone: entity.phone,
				role: RoleEnum.RESTAURANT,
				created_at: new Date(),
				updated_at: new Date(),
			},
			user_id: null,
			card_id: null,
			address: entity.address,
			description: entity.description
		});

		await newRestaurant.hashPassword(entity.password);
		const lastInsertId = await this.userService.create(newRestaurant.user);

		if (lastInsertId) {
			newRestaurant = new Restaurant({
				...newRestaurant,
				user_id: lastInsertId
			});

			const { user, id, ...customer } = newRestaurant;

			newRestaurant.user = {
				id: lastInsertId,
				...newRestaurant.user,
			}

			await super.create(customer);

			delete newRestaurant.user.password;

			return {
				code: 200,
				data: newRestaurant,
				message: 'Votre compte restaurant a bien été créé'
			};
		} else {
			Handler.logger('Échec de la récupération du dernier identifiant', 'error');

			return {
				code: 500,
				data: null,
				message: 'Une erreur interne est survenue'
			};
		}
	}

	public async update(entity: Partial<RestaurantType & UserType & { card: CardType }>, id: string): Promise<ResponseType<RestaurantType & { card: CardType }>> {
		// Est-ce que le restaurant existe ?
		const restaurantExists = await this.select(false, 'id', 'user_id', 'card_id', 'address', 'description')
			.selectJoin('users', false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
			.join('INNER JOIN', 'users', 'users.id', 'restaurants.user_id')
			.where('restaurants.user_id', '=', id)
			.run()
		const restaurantExist = restaurantExists[0];

		if (restaurantExist) {
			let updateRestaurant = new Restaurant({
				id: restaurantExist.id,
				user_id: restaurantExist.user_id,
				card_id: restaurantExist.card_id,
				address: entity.address ?? restaurantExist.address,
				description: entity.description ?? restaurantExist.description,
				user: {
					id: restaurantExist.user.id,
					email: entity.email ?? restaurantExist.user.email.toLowerCase(),
					password: entity.password,
					name: entity.name ?? restaurantExist.user.name,
					phone: entity.phone ?? restaurantExist.user.phone,
					role: restaurantExist.user.role,
					created_at: restaurantExist.user.created_at,
					updated_at: new Date(),
				}
			});

			if (entity.password) {
				await updateRestaurant.hashPassword(entity.password);
			}

			await this.userService.update(updateRestaurant.user, restaurantExist.user_id);

			const { user, ...restaurant } = updateRestaurant;

			// Si on modifie ou ajoute une carte, on vérifie si elle existe déjà
			if (entity.card && entity.card.description.length > 0) {
				const restaurantCardExists = await this.select(false, 'card_id')
					.selectJoin('cards', false, 'id')
					.join('INNER JOIN', 'cards', 'cards.id', 'restaurants.card_id')
					.where('restaurants.user_id', '=', restaurantExist.user_id)
					.run();
				const restaurantCardExist = restaurantCardExists[0];

				if (!restaurantCardExist) {
					restaurant.card_id = await this.cardService.create(entity.card);

					await super.update({ card_id: restaurant.card_id }, restaurantExist.id);
				} else {

					await this.cardService.update(entity.card, restaurantCardExist.card_id);
				}
			}

			let card: CardType = { id: null, description: null };

			// On récupère la carte du restaurant
			const restaurantCardExists = await this.select(false, 'card_id')
				.selectJoin('cards', false, 'id', 'description')
				.join('INNER JOIN', 'cards', 'cards.id', 'restaurants.card_id')
				.where('restaurants.user_id', '=', restaurantExist.user_id)
				.run();
			const restaurantCardExist = restaurantCardExists[0] as RestaurantType & { card: CardType };

			if (restaurantCardExist) {
				card.id = restaurantCardExist.card_id;
				card.description = restaurantCardExist.card.description;
			}

			await super.update(restaurant, restaurantExist.id);

			delete updateRestaurant.user.password;
			delete updateRestaurant.id;

			return {
				code: 200,
				data: {
					...updateRestaurant,
					card: (card.id && card.description) ? card : null
				},
				message: 'Votre compte restaurant a bien été modifié'
			};
		} else {
			return {
				code: 404,
				data: null,
				message: 'Ce compte client n\'existe pas'
			};
		}
	}
}

Container.register('RestaurantService', new RestaurantService());

export default RestaurantService;