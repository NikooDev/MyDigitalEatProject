import { CustomerType, RoleEnum, UserType } from '@Src/interfaces/User';
import ResponseType from '@Src/interfaces/Response';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';
import Customer from '@Entities/Customer';
import UserService from '@Services/UserService';
import Handler from '@Core/response/handler';
import Inject from '@Core/service/Inject';

class CustomerService extends DaoService<CustomerType> {
	@Inject('UserService')
	private userService: UserService;

	constructor() {
		super('customers');
	}

	public async create(entity: CustomerType & UserType): Promise<ResponseType<CustomerType>> {
		let newCustomer = new Customer({
			user: {
				email: entity.email.toLowerCase(),
				password: entity.password,
				name: entity.name,
				phone: entity.phone,
				role: RoleEnum.CUSTOMER,
				created_at: new Date(),
				updated_at: new Date()
			},
			address: entity.address,
			user_id: null
		});

		await newCustomer.hashPassword(entity.password);
		const lastInsertId = await this.userService.create(newCustomer.user);

		if (lastInsertId) {
			newCustomer = new Customer({
				...newCustomer,
				user_id: lastInsertId
			});

			const { user, id, ...customer } = newCustomer;

			newCustomer.user = {
				id: lastInsertId,
				...newCustomer.user,
			}

			await super.create(customer);

			delete newCustomer.user.password;

			return {
				code: 200,
				data: newCustomer,
				message: 'Votre compte client a bien été créé'
			};
		} else {
			Handler.logger('Échec de la récupération du dernier identifiant de l\'utilisateur', 'error');

			return {
				code: 500,
				data: null,
				message: 'Une erreur interne est survenue'
			};
		}
	}

	public async update(entity: Partial<CustomerType & UserType>, id: string): Promise<ResponseType<CustomerType>> {
		const customersExist = await this.select(false, 'id', 'user_id')
			.selectJoin('users', false, 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
			.join('INNER JOIN', 'users', 'users.id', 'customers.user_id')
			.where('customers.user_id', '=', id)
			.run()
		const customerExist = customersExist[0];

		if (customerExist) {
			const updateCustomer = new Customer({
				id: customerExist.id,
				user_id: customerExist.user_id,
				address: entity.address ?? customerExist.address,
				user: {
					id: customerExist.user.id,
					email: entity.email ?? customerExist.user.email.toLowerCase(),
					password: entity.password,
					name: entity.name ?? customerExist.user.name,
					phone: entity.phone ?? customerExist.user.phone,
					role: customerExist.user.role,
					created_at: customerExist.user.created_at,
					updated_at: new Date(),
				}
			});

			if (entity.password) {
				await updateCustomer.hashPassword(entity.password);
			}

			await this.userService.update(updateCustomer.user, customerExist.user_id);

			const { user, ...customer } = updateCustomer;

			await super.update(customer, customerExist.user_id);

			delete updateCustomer.user.password;

			return {
				code: 200,
				data: updateCustomer,
				message: 'Votre compte client a bien été modifié'
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

Container.register('CustomerService', new CustomerService());

export default CustomerService;