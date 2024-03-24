import { Request, Response } from 'express';
import Controller from '@Src/interfaces/Controller';
import { customerController, deliverymanController } from '@Core/constants/errors';
import Handler from '@Core/response/handler';
import DeliverymanService from '@Services/DeliverymanService';
import UserService from '@Services/UserService';
import Inject from '@Core/service/Inject';

class DeliverymanController implements Controller {
	@Inject('DeliverymanService')
	private deliverymanService: DeliverymanService;

	@Inject('UserService')
	private userService: UserService;

	public async create(req: Request, res: Response) {
		const data = req.body;

		await Handler.tryCatch(res, deliverymanController.create, async () => {
			const deliveryman = await this.deliverymanService.create(data);

			return (Handler[deliveryman.code === 200 ? 'success' : 'exception'])(res, deliveryman.message, deliveryman.code, { deliveryman: deliveryman.data });
		});
	}

	public async read(req: Request, res: Response) {
		const user = req.user;

		await Handler.tryCatch(res, deliverymanController.read, async () => {
			const deliveryman = await this.deliverymanService.read(user);

			return (Handler[deliveryman.code === 200 ? 'success' : 'exception'])(res, deliveryman.message, deliveryman.code, { deliveryman: deliveryman.data });
		});
	}

	public async update(req: Request, res: Response) {
		const data = req.body;
		const params = req.params;

		await Handler.tryCatch(res, customerController.update, async () => {
			const deliveryman = await this.deliverymanService.update(data, params.id);

			return (Handler[deliveryman.code === 200 ? 'success' : 'exception'])(res, deliveryman.message, deliveryman.code, { deliveryman: deliveryman.data });
		});
	}

	public async delete(req: Request, res: Response) {
		const params = req.params;

		await Handler.tryCatch(res, customerController.delete, async () => {
			const deliveryman = await this.userService.delete(params.id);

			return (Handler[deliveryman.code === 200 ? 'success' : 'exception'])(res, deliveryman.message, deliveryman.code);
		});
	}
}

export default new DeliverymanController();