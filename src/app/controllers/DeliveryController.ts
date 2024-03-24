import { Request, Response } from 'express';
import Controller from '@Src/interfaces/Controller';
import Inject from '@Core/service/Inject';
import { deliveryController } from '@Core/constants/errors';
import Handler from '@Core/response/handler';
import DeliveryService from '@Services/DeliveryService';

class DeliveryController implements Controller {
	@Inject('DeliveryService')
	private deliveryService: DeliveryService;

	public async create(req: Request, res: Response) {
		const data = req.body;
		const user = req.user;
		const delivery = await this.deliveryService.create(data, user);
		await Handler.tryCatch(res, deliveryController.create, async () => {


			return (Handler[delivery.code === 200 ? 'success' : 'exception'])(res, delivery.message, delivery.code, { delivery: delivery.data });
		});
	}

	public async read(req: Request, res: Response) {
		const user = req.user;

		await Handler.tryCatch(res, deliveryController.read, async () => {
			const delivery = await this.deliveryService.read(user);

			return (Handler[delivery.code === 200 ? 'success' : 'exception'])(res, delivery.message, delivery.code, { delivery: delivery.data });
		});
	}

	public update(_req: Request, _res: Response) {}

	public async delete(req: Request, res: Response) {
		const params = req.params;

		await Handler.tryCatch(res, deliveryController.delete, async () => {
			const delivery = await this.deliveryService.delete(params.id);

			return (Handler[delivery.code === 200 ? 'success' : 'exception'])(res, delivery.message, delivery.code);
		});
	}

}

export default new DeliveryController();