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

	public async update(entity: Partial<DeliverymanType & UserType>, id: string): Promise<ResponseType<DeliverymanType>> {
		const deliverymanExists = await this.select(false, 'id', 'user_id')
			.selectJoin('users', false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
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

			await super.update(deliveryman, deliverymanExist.user_id);

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