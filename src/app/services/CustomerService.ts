import { CustomerType, RoleEnum, UserType } from '@Src/interfaces/User';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';
import Customer from '@Entities/Customer';
import UserService from '@Services/UserService';
import Inject from '@Core/service/Inject';

class CustomerService extends DaoService<CustomerType> {
	@Inject('UserService')
	private userService: UserService;

	constructor() {
		super('customers');
	}

	public async create(entity: CustomerType & UserType): Promise<CustomerType> {
		let newCustomer = new Customer({
			user: {
				email: entity.email.toLowerCase(),
				password: entity.password,
				name: entity.name,
				phone: entity.phone,
				role: RoleEnum.CUSTOMER,
				created_at: new Date(),
				updated_at: new Date(),
			},
			address: entity.address,
			user_id: undefined
		});

		await newCustomer.hashPassword(entity.password);
		const lastInsertId = await this.userService.create(newCustomer.user);

		if (lastInsertId) {
			newCustomer = new Customer({
				...newCustomer,
				user_id: lastInsertId
			});

			const { user, ...customer } = newCustomer;

			await super.create(customer);

			return newCustomer;
		} else {
			throw new Error('Échec de la récupération du dernier identifiant');
		}
	}

	public async update(entity: Partial<CustomerType & UserType>, id: number): Promise<CustomerType> {
		const customerExist = await this.select('user_id')
			.selectJoin('users', 'id', 'email', 'password', 'name', 'phone', 'role', 'created_at', 'updated_at')
			.join('INNER JOIN', 'customers', 'customers.user_id', 'users.id')
			.run();

		console.log(customerExist);

		const updateCustomer = new Customer({
			user: {
				email: entity.email.toLowerCase(),
				password: entity.password,
				name: entity.name,
				phone: entity.phone,
				role: RoleEnum.CUSTOMER,
				created_at: new Date(),
				updated_at: new Date(),
			},
			address: entity.address,
			user_id: id
		});

		await this.userService.update(updateCustomer.user, id);

		const { user, ...customer } = updateCustomer;

		await super.update(customer, id);

		return updateCustomer;
	}
}

Container.register('CustomerService', new CustomerService());

export default CustomerService;