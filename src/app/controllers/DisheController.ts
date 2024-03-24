import { Request, Response } from 'express';
import Controller from '@Src/interfaces/Controller';
import { disheController } from '@Core/constants/errors';
import Handler from '@Core/response/handler';
import DisheService from '@Services/DisheService';
import Inject from '@Core/service/Inject';

class DisheController implements Controller {
	@Inject('DisheService')
	private disheService: DisheService;

	public async create(req: Request, res: Response) {
		const data = req.body;
		const user = req.user;

		await Handler.tryCatch(res, disheController.create, async () => {
			const dishe = await this.disheService.create(data, user);

			return (Handler[dishe.code === 200 ? 'success' : 'exception'])(res, dishe.message, dishe.code, { dishe: dishe.data });
		});
	}

	public async read(_: Request, res: Response) {
		await Handler.tryCatch(res, disheController.read, async () => {
			const dishes = await this.disheService.read();

			return (Handler[dishes.code === 200 ? 'success' : 'exception'])(res, dishes.message, dishes.code, { dishes: dishes.data });
		});
	}

	public async update(req: Request, res: Response) {
		const data = req.body;
		const params = req.params;

		await Handler.tryCatch(res, disheController.update, async () => {
			const dishe = await this.disheService.update(data, params.id);

			return (Handler[dishe.code === 200 ? 'success' : 'exception'])(res, dishe.message, dishe.code, { dishe: dishe.data });
		});
	}

	public async delete(req: Request, res: Response) {
		const params = req.params;

		await Handler.tryCatch(res, disheController.update, async () => {
			const dishe = await this.disheService.delete(params.id);

			return (Handler[dishe.code === 200 ? 'success' : 'exception'])(res, dishe.message, dishe.code);
		});
	}
}

export default new DisheController();