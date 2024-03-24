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
			.selectJoin('users', false, false, 'email', 'name', 'phone')
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
			.selectJoin('users', false, false, 'email', 'name', 'phone')
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
			.selectJoin('users', false, false, 'email', 'name', 'phone')
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
			menus: menusExist && menusExist.menu ? menusExist.menu : null,
			dishes: dishesExist && dishesExist.dishe ? dishesExist.dishe : null
		}

		return {
			code: 200,
			message: 'Votre commande a bien été créée',
			data: order
		}
	}

	public async read(user: UserType): Promise<ResponseType<any>> {
		if (!user) {
			return {
				data: null,
				code: 404,
				message: 'Accès interdit, veuillez vous identifier'
			}
		}

		let deliveries = await this.select(false, 'id', 'customer_id', 'deliveryman_id', 'restaurant_id', 'status', 'created_at')
			.groupBy('restaurants.id', 'deliverymans.id', 'customers.id')
			.selectJoin('users', false, false, 'id', 'name', 'email', 'phone', 'role')
			.join('LEFT JOIN', 'users', 'users.id', user.id.toString())
			.selectJoin('customers', false, false, 'id', 'user_id', 'address')
			.join('LEFT JOIN', 'customers', 'customers.user_id', 'deliveries.customer_id')
			.selectJoin('restaurants', false, false, 'id', 'user_id', 'card_id', 'description', 'address')
			.join('LEFT JOIN', 'restaurants', 'restaurants.user_id', 'deliveries.restaurant_id')
			.selectJoin('deliverymans', false, false, 'id', 'user_id', 'status', 'address')
			.join('LEFT JOIN', 'deliverymans', 'deliverymans.user_id', 'deliveries.deliveryman_id')
			.selectJoin('orders_deliveries', true, false, 'menu_id', 'dishe_id')
			.join('LEFT JOIN', 'orders_deliveries', 'orders_deliveries.delivery_id', 'deliveries.id')
			.selectJoin('menus', true, false, 'id', 'card_id', 'name', 'price', 'description')
			.join('LEFT JOIN', 'menus', 'menus.id', 'orders_deliveries.menu_id')
			.selectJoin('dishes', true, false, 'id', 'card_id', 'name', 'price')
			.join('LEFT JOIN', 'dishes', 'dishes.id', 'orders_deliveries.dishe_id')
			.run();

		/**
		 * Détail de la requête SQL brute générée :
		 *
		 * SELECT deliveries.id, deliveries.customer_id, deliveries.deliveryman_id, deliveries.restaurant_id,
		 * deliveries.status, deliveries.created_at,
		 * JSON_OBJECT('id', users.id, 'name', users.name, 'email', users.email, 'phone', users.phone, 'role', users.role) AS user,
		 * JSON_OBJECT('id', customers.id, 'user_id', customers.user_id, 'address', customers.address) AS customer,
		 * JSON_OBJECT('id', restaurants.id, 'user_id', restaurants.user_id, 'card_id', restaurants.card_id, 'description', restaurants.description, 'address', restaurants.address) AS restaurant,
		 * JSON_OBJECT('id', deliverymans.id, 'user_id', deliverymans.user_id, 'status', deliverymans.status, 'address', deliverymans.address) AS deliveryman,
		 * JSON_ARRAYAGG(JSON_OBJECT('menu_id', orders_deliveries.menu_id, 'dishe_id', orders_deliveries.dishe_id)) AS orders_deliverie,
		 * JSON_ARRAYAGG(JSON_OBJECT('id', menus.id, 'card_id', menus.card_id, 'name', menus.name, 'price', menus.price, 'description', menus.description)) AS menu,
		 * JSON_ARRAYAGG(JSON_OBJECT('id', dishes.id, 'card_id', dishes.card_id, 'name', dishes.name, 'price', dishes.price)) AS dishe
		 * FROM deliveries
		 * LEFT JOIN users ON users.id = 49
		 * LEFT JOIN customers ON customers.user_id = deliveries.customer_id
		 * LEFT JOIN restaurants ON restaurants.user_id = deliveries.restaurant_id
		 * LEFT JOIN deliverymans ON deliverymans.user_id = deliveries.deliveryman_id
		 * LEFT JOIN orders_deliveries ON orders_deliveries.delivery_id = deliveries.id
		 * LEFT JOIN menus ON menus.id = orders_deliveries.menu_id
		 * LEFT JOIN dishes ON dishes.id = orders_deliveries.dishe_id
		 * WHERE deliveries.customer_id = 49 OR deliveries.deliveryman_id = 49 OR deliveries.restaurant_id = 49
		 * GROUP BY deliveries.id, deliveries.customer_id, deliveries.deliveryman_id, deliveries.restaurant_id, deliveries.status, deliveries.created_at, restaurants.id, deliverymans.id, customers.id
		 */

		deliveries.forEach((deliverie) => {
			deliverie.menu = deliverie.menu.filter((menu: any) => menu.id !== null);
			deliverie.dishe = deliverie.dishe.filter((dishe: any) => dishe.id !== null);

			delete deliverie.orders_deliverie;
		});

		if (deliveries.length === 0) {
			return {
				code: 404,
				data: null,
				message: 'Aucune commande trouvée'
			}
		}

		return {
			code: 200,
			data: deliveries,
			message: 'Liste des commandes'
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
			.selectJoin('cards', false, false, 'id', 'description')
			.join('LEFT JOIN', 'cards', 'restaurants.card_id', 'cards.id')
			.selectJoin('menus', true, false, 'id', 'card_id', 'name', 'price', 'description')
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
			.selectJoin('cards', false, false, 'id', 'description')
			.join('LEFT JOIN', 'cards', 'restaurants.card_id', 'cards.id')
			.selectJoin('dishes', true, false, 'id', 'card_id', 'name', 'price')
			.join('LEFT JOIN', 'dishes', 'dishes.card_id', 'cards.id')
			.where('dishes.id', 'IN', dishes)
			.andWhere('restaurants.user_id', '=', restaurant_id)
			.run() as RestaurantType[] & RestaurantType & { dishe: DisheType[] };
	}
}

Container.register('DeliveryService', new DeliveryService());

export default DeliveryService;