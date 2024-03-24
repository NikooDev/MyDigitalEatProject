import { DeliverymanType, RoleEnum, StatusEnum, UserType } from '@Src/interfaces/User';
import ResponseType from '@Src/interfaces/Response';
import Container from '@Core/service/Container';
import DaoService from '@Services/DaoService';
import Deliveryman from '@Entities/Deliveryman';
import Handler from '@Core/response/handler';
import UserService from '@Services/UserService';
import Inject from '@Core/service/Inject';

class DeliverymanService extends DaoService<DeliverymanType> {
	@Inject('UserService')
	private userService: UserService;

	constructor() {
		super('deliverymans');
	}

	public async create(entity: Partial<DeliverymanType & UserType>): Promise<ResponseType<DeliverymanType>> {
		let newDeliveryman = new Deliveryman({
			user: {
				email: entity.email.toLowerCase(),
				password: entity.password,
				name: entity.name,
				phone: entity.phone,
				role: RoleEnum.DELIVERYMAN,
				created_at: new Date(),
				updated_at: new Date(),
			},
			status: StatusEnum.AVAILABLE,
			address: entity.address,
			user_id: null
		});

		await newDeliveryman.hashPassword(entity.password);
		const lastInsertId = await this.userService.create(newDeliveryman.user);

		if (lastInsertId) {
			newDeliveryman = new Deliveryman({
				...newDeliveryman,
				user_id: lastInsertId
			});

			const { user, id, ...customer } = newDeliveryman;

			newDeliveryman.user = {
				id: lastInsertId,
				...newDeliveryman.user,
			}

			await super.create(customer);

			delete newDeliveryman.user.password;

			return {
				code: 200,
				data: newDeliveryman,
				message: 'Votre compte livreur a bien été créé'
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

	public async read(user: UserType): Promise<ResponseType<DeliverymanType & any>> {
		if (!user) {
			return {
				data: null,
				code: 404,
				message: 'Accès interdit, veuillez vous identifier'
			}
		}

		const deliverymans = await this.select(false, 'user_id', 'address', 'status')
			.selectJoin('users', false, false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
			.join('INNER JOIN', 'users', 'users.id', 'deliverymans.user_id')
			.where('deliverymans.user_id', '=', user.id)
			.run();

		const deliveries = await this.select(false, 'user_id', 'address', 'status')
			.groupBy('deliveries.id', 'restaurants.id', 'deliverymans.id', 'customers.address')
			.selectJoin('deliveries', false, false, 'id', 'customer_id', 'deliveryman_id', 'restaurant_id', 'status', 'created_at')
			.join('LEFT JOIN', 'deliveries', 'deliveries.deliveryman_id', user.id.toString())
			.selectJoin('customers', false, false, 'user_id', 'address')
			.join('INNER JOIN', 'customers', 'customers.user_id', 'deliveries.customer_id')
			.selectJoin('restaurants', false, false, 'user_id', 'card_id', 'description', 'address')
			.join('LEFT JOIN', 'restaurants', 'restaurants.user_id', 'deliveries.restaurant_id')
			.selectJoin('menus', true, true, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
			.join('LEFT JOIN', 'menus', 'menus.restaurant_id', 'deliveries.restaurant_id')
			.selectJoin('dishes', true, true, 'id', 'card_id', 'restaurant_id', 'name', 'price')
			.join('LEFT JOIN', 'dishes', 'dishes.restaurant_id', 'deliveries.restaurant_id')
			.where('deliverymans.user_id', '=', user.id)
			.run();

		if (deliverymans.length === 0) {
			return {
				data: null,
				code: 403,
				message: 'Vous n\'êtes pas autorisé à accéder à cette ressource'
			}
		}

		deliveries.forEach(delivery => {
			delivery.menu = JSON.parse(delivery.menu as unknown as string);
			delivery.dishe = JSON.parse(delivery.dishe as unknown as string);

			return delivery;
		});

		const deliveryman = {
			...deliverymans[0],
			deliveries: deliveries
		}

		return {
			code: 200,
			data: deliveryman,
			message: ''
		}
	}

	public async update(entity: Partial<DeliverymanType & UserType>, id: string | number): Promise<ResponseType<DeliverymanType>> {
		const deliverymanExists = await this.select(false, 'id', 'user_id', 'status', 'address')
			.selectJoin('users', false, false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
			.join('INNER JOIN', 'users', 'users.id', 'deliverymans.user_id')
			.where('deliverymans.user_id', '=', id)
			.run()
		const deliverymanExist = deliverymanExists[0];

		if (deliverymanExist) {
			const updateDeliveryman = new Deliveryman({
				id: deliverymanExist.id,
				user_id: deliverymanExist.user_id,
				address: entity.address ?? deliverymanExist.address,
				status: entity.status ?? deliverymanExist.status,
				user: {
					id: deliverymanExist.user.id,
					email: entity.email ?? deliverymanExist.user.email.toLowerCase(),
					password: entity.password,
					name: entity.name ?? deliverymanExist.user.name,
					phone: entity.phone ?? deliverymanExist.user.phone,
					role: deliverymanExist.user.role,
					created_at: deliverymanExist.user.created_at,
					updated_at: new Date(),
				}
			});

			if (entity.password) {
				await updateDeliveryman.hashPassword(entity.password);
			}

			await this.userService.update(updateDeliveryman.user, deliverymanExist.user_id);

			const { user, ...deliveryman } = updateDeliveryman;

			await super.update(deliveryman, deliverymanExist.id);

			delete updateDeliveryman.user.password;

			return {
				code: 200,
				data: updateDeliveryman,
				message: 'Votre compte livreur a bien été modifié'
			};
		} else {
			return {
				code: 404,
				data: null,
				message: 'Ce compte livreur n\'existe pas'
			};
		}
	}
}

Container.register('DeliverymanService', new DeliverymanService());

export default DeliverymanService;