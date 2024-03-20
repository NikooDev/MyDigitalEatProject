import { Request, Response } from 'express';
import Controller from '@Src/interfaces/Controller';
import Inject from '@Core/service/Inject';
import { customerController } from '@Core/constants/errors';
import Handler from '@Core/response/handler';
import CustomerService from '@Services/CustomerService';

class CustomerController implements Controller {
	@Inject('CustomerService')
	private customerService: CustomerService;

	public async create(req: Request, res: Response) {
		const data = req.body;

		await Handler.tryCatch(res, customerController.create, async () => {
			const customer = await this.customerService.create(data);

			return Handler.success(res, 'Votre compte client a bien été créé', customer);
		});
	}

	public read(req: Request, res: Response) {

	}

	public async update(req: Request, res: Response) {
		const data = req.body;
		const params = req.params;
		const paramId = Number(params.id);

		await Handler.tryCatch(res, customerController.update, async () => {
			const customer = await this.customerService.update(data, paramId);

			return Handler.success(res, 'Votre compte client a bien été créé', customer);
		});
	}

	public delete(req: Request, res: Response) {

	}
}

export default new CustomerController();