import ResponseType from '@Src/interfaces/Response';
import MenuType from '@Src/interfaces/Menu';
import DisheType from '@Src/interfaces/Dishe';
import { RestaurantType, StatusEnum, UserType } from '@Src/interfaces/User';
import DeliveryType, { DeliveryEnum } from '@Src/interfaces/Delivery';
import Inject from '@Core/service/Inject';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';
import DeliverymanService from '@Services/DeliverymanService';
import RestaurantService from '@Services/RestaurantService';
import CustomerService from '@Services/CustomerService';
import Delivery from '@Entities/Delivery';

class DeliveryService extends DaoService<DeliveryType> {
	@Inject('DeliverymanService')
	private deliverymanService: DeliverymanService;

	@Inject('RestaurantService')
	private restaurantService: RestaurantService;

	@Inject('CustomerService')
	private customerService: CustomerService;

	constructor() {
		super('deliveries');
	}

	public async create(entity: Partial<DeliveryType & { menus: number[], dishes: number[] }>, user?: UserType): Promise<ResponseType<DeliveryType>> {
		if (!user) {
			return {
				code: 403,
				message: 'Accès refusé, veuillez-vous authentifier',
				data: null
			};
		}

		// Attribution d'un livreur disponible au hasard à la commande
		const deliverymansAvailable = await this.deliverymanService.select(false, 'id', 'user_id', 'status', 'address')
			.selectJoin('users', false, 'email', 'name', 'phone')
			.join('LEFT JOIN', 'users', 'deliverymans.user_id', 'users.id')
			.where('status', '=', StatusEnum.AVAILABLE)
			.orderBy('RAND()', 'ASC')
			.limit(1)
			.run();
		const deliverymanAvailable = deliverymansAvailable[0];

		if (!deliverymanAvailable) {
			return {
				code: 404,
				message: 'Il n\'y a aucun livreur disponible actuellement',
				data: null
			}
		}

		const deliverymanDatas = {
			id: deliverymanAvailable.id,
			user_id: deliverymanAvailable.user_id,
			name: deliverymanAvailable.user.name,
			email: deliverymanAvailable.user.email,
			status: StatusEnum.ON_DELIVERY,
			address: deliverymanAvailable.address,
			phone: deliverymanAvailable.user.phone
		}

		// Vérification de l'existence du restaurant
		const restaurantExists = await this.restaurantService.select(false, 'id', 'user_id', 'card_id', 'description', 'address')
			.selectJoin('users', false, 'email', 'name', 'phone')
			.join('LEFT JOIN', 'users', 'restaurants.user_id', 'users.id')
			.where('user_id', '=', entity.restaurant_id)
			.run();
		const restaurantExist = restaurantExists[0];

		if (!restaurantExist) {
			return {
				code: 404,
				message: `Le restaurant user_id=${entity.restaurant_id} n'existe pas`,
				data: null
			}
		}

		if (!restaurantExist.card_id) {
			return {
				code: 404,
				message: `Le restaurant user_id=${entity.restaurant_id} ne possède pas de carte`,
				data: null
			}
		}

		const restaurantDatas = {
			id: restaurantExist.id,
			user_id: restaurantExist.user_id,
			card_id: restaurantExist.card_id,
			name: restaurantExist.user.name,
			email: restaurantExist.user.email,
			description: restaurantExist.description,
			address: restaurantExist.address,
			phone: restaurantExist.user.phone
		}

		// Vérification de l'existence des menus et leur appartenance dans le restaurant existant
		const menusExists = await this.checkMenus(entity.menus, entity.restaurant_id) as RestaurantType[] & RestaurantType & {menu: MenuType[]} | [];
		if (menusExists.length === 0 && entity.menus && entity.menus.length > 0) {
			const plurial = entity.menus.length > 1 ? `Les menus ${entity.menus.join(', ')} n'existent` : `Le menu ${entity.menus} n'existe`;

			return {
				code: 404,
				message: `${plurial} pas dans le restaurant user_id=${entity.restaurant_id}`,
				data: null
			}
		}

		const menusExist = menusExists[0] as MenuType[] & RestaurantType & {menu: MenuType[]};

		// Vérification de l'existence des menus et leur appartenance dans le restaurant existant
		const dishesExists = await this.checkDishes(entity.dishes, entity.restaurant_id) as RestaurantType[] & RestaurantType & {dishe: DisheType[]} | [];
		if (dishesExists.length === 0 && entity.dishes && entity.dishes.length > 0) {
			const plurial = entity.dishes.length > 1 ? `Les plats ${entity.dishes.join(', ')} n'existent` : `Le plat ${entity.dishes} n'existe`;

			return {
				code: 404,
				message: `${plurial} pas dans le restaurant user_id=${entity.restaurant_id}`,
				data: null
			}
		}

		const dishesExist = dishesExists[0] as DisheType[] & RestaurantType & {dishe: DisheType[]};

		// Récupération des données du customer
		const customers = user.id && await this.customerService.select(false, 'id', 'user_id', 'address')
			.selectJoin('users', false, 'email', 'name', 'phone')
			.join('LEFT JOIN', 'users', 'customers.user_id', 'users.id')
			.where('user_id', '=', user.id)
			.run();
		const customer = customers[0];

		const customerDatas = {
			id: customer.id,
			user_id: customer.user_id,
			name: customer.user.name,
			email: customer.user.email,
			address: customer.address,
			phone: customer.user.phone
		}

		let newDelivery = new Delivery({
			customer_id: customerDatas.user_id,
			deliveryman_id: deliverymanDatas.user_id,
			restaurant_id: restaurantDatas.user_id,
			status: DeliveryEnum.PENDING,
			created_at: new Date()
		});

		const { id, ...delivery } = newDelivery;

		await super.create(delivery);

		const lastInsertId = await this.select(true, 'LAST_INSERT_ID() AS id')
			.limit(1)
			.run();

		if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
			newDelivery.id = lastInsertId[0].id;
		}

		// Pour chaque menu => création de l'entrée dans la table pivot orders_items
		if (menusExist && menusExist.menu && menusExist.menu.length > 0) {
			for (let i = 0; i < menusExist.menu.length; i++) {
				await this.createOrderDelivery(newDelivery.id, menusExist.menu[i].id, null);
			}
		}

		// Pour chaque plats => création de l'entrée dans la table pivot orders_items
		if (dishesExist && dishesExist.dishe && dishesExist.dishe.length > 0) {
			for (let i = 0; i < dishesExist.dishe.length; i++) {
				await this.createOrderDelivery(newDelivery.id, null, dishesExist.dishe[i].id);
			}
		}

		// Mise à jour du statut du livreur
		await this.deliverymanService.update({ status: StatusEnum.ON_DELIVERY }, deliverymanAvailable.user_id);

		const order = {
			...newDelivery,
			customer: customerDatas,
			deliveryman: deliverymanDatas,
			restaurant: restaurantDatas,
			menus: menusExist.menu,
			plats: dishesExist.dishe
		}

		return {
			code: 200,
			message: 'Votre commande a bien été créée',
			data: order
		}
	}

	public async delete(id: string): Promise<ResponseType<void | DeliveryType>> {
		const deliveryExists = await this.select(false, 'id')
			.where('id', '=', id)
			.run();
		const deliveryExist = deliveryExists[0];

		if (deliveryExist) {
			await super.delete(id);

			return {
				code: 200,
				data: null,
				message: 'La commande a bien été supprimé'
			}
		} else {
			return {
				code: 404,
				data: null,
				message: 'Cette commande n\'existe pas'
			}
		}
	}

	private async createOrderDelivery(order: number, menu: number = null, dishe: number = null) {
		this.query = `INSERT INTO orders_deliveries (delivery_id, menu_id, dishe_id) VALUES (?, ?, ?)`;

		return await this.execute(this.query, [order, menu, dishe]);
	}

	private async checkMenus(menus: number[], restaurant_id: number): Promise<RestaurantType[] & RestaurantType & { menu: MenuType[] } | []> {
		if (!menus) {
			return [];
		}

		return await this.restaurantService.select(false, 'user_id', 'description', 'address')
			.groupBy('cards.id')
			.selectJoin('cards', false, 'id', 'description')
			.join('LEFT JOIN', 'cards', 'restaurants.card_id', 'cards.id')
			.selectJoin('menus', true, 'id', 'card_id', 'name', 'price', 'description')
			.join('LEFT JOIN', 'menus', 'menus.card_id', 'cards.id')
			.where('menus.id', 'IN', menus)
			.andWhere('restaurants.user_id', '=', restaurant_id)
			.run() as RestaurantType[] & RestaurantType & { menu: MenuType[] };
	}

	private async checkDishes(dishes: number[], restaurant_id: number): Promise<RestaurantType[] & RestaurantType & {dishe: DisheType[]} | []> {
		if (!dishes) {
			return [];
		}

		return await this.restaurantService.select(false, 'user_id', 'description', 'address')
			.groupBy('cards.id')
			.selectJoin('cards', false, 'id', 'description')
			.join('LEFT JOIN', 'cards', 'restaurants.card_id', 'cards.id')
			.selectJoin('dishes', true, 'id', 'card_id', 'name', 'price')
			.join('LEFT JOIN', 'dishes', 'dishes.card_id', 'cards.id')
			.where('dishes.id', 'IN', dishes)
			.andWhere('restaurants.user_id', '=', restaurant_id)
			.run() as RestaurantType[] & RestaurantType & { dishe: DisheType[] };
	}
}

Container.register('DeliveryService', new DeliveryService());

export default DeliveryService;