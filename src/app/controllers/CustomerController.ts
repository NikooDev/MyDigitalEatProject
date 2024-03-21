import { Request, Response } from 'express';
import Controller from '@Src/interfaces/Controller';
import Inject from '@Core/service/Inject';
import { customerController } from '@Core/constants/errors';
import Handler from '@Core/response/handler';
import CustomerService from '@Services/CustomerService';
import UserService from '@Services/UserService';

class CustomerController implements Controller {
	@Inject('CustomerService')
	private customerService: CustomerService;

	@Inject('UserService')
	private userService: UserService;

	public async create(req: Request, res: Response) {
		const data = req.body;

		await Handler.tryCatch(res, customerController.create, async () => {
			const customer = await this.customerService.create(data);

			return (Handler[customer.code === 200 ? 'success' : 'exception'])(res, customer.message, customer.code, { customer: customer.data });
		});
	}

	public read(req: Request, res: Response) {

	}

	public async update(req: Request, res: Response) {
		const data = req.body;
		const params = req.params;

		await Handler.tryCatch(res, customerController.update, async () => {
			const customer = await this.customerService.update(data, params.id);

			return (Handler[customer.code === 200 ? 'success' : 'exception'])(res, customer.message, customer.code, { customer: customer.data });
		});
	}

	public async delete(req: Request, res: Response) {
		const params = req.params;

		await Handler.tryCatch(res, customerController.delete, async () => {
			const customer = await this.userService.delete(params.id);

			return (Handler[customer.code === 200 ? 'success' : 'exception'])(res, customer.message, customer.code);
		});
	}
}

export default new CustomerController();