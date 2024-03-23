import { Request, Response } from 'express';
import Controller from '@Src/interfaces/Controller';
import { restaurantController } from '@Core/constants/errors';
import RestaurantService from '@Services/RestaurantService';
import UserService from '@Services/UserService';
import Handler from '@Core/response/handler';
import Inject from '@Core/service/Inject';

class RestaurantController implements Controller {
	@Inject('RestaurantService')
	private restaurantService: RestaurantService;

	@Inject('UserService')
	private userService: UserService;

	public async create(req: Request, res: Response) {
		const data = req.body;

		await Handler.tryCatch(res, restaurantController.create, async () => {
			const restaurant = await this.restaurantService.create(data);

			return (Handler[restaurant.code === 200 ? 'success' : 'exception'])(res, restaurant.message, restaurant.code, { restaurant: restaurant.data });
		});
	}

	public async read(req: Request, res: Response) {
		// Tous les restaurants avec leurs cartes, menus et plats
	}

	public async update(req: Request, res: Response) {
		const data = req.body;
		const params = req.params;
		const restaurant = await this.restaurantService.update(data, params.id);
		await Handler.tryCatch(res, restaurantController.update, async () => {


			return (Handler[restaurant.code === 200 ? 'success' : 'exception'])(res, restaurant.message, restaurant.code, { restaurant: restaurant.data });
		});
	}

	public async delete(req: Request, res: Response) {
		const params = req.params;

		await Handler.tryCatch(res, restaurantController.delete, async () => {
			const restaurant = await this.userService.delete(params.id);

			return (Handler[restaurant.code === 200 ? 'success' : 'exception'])(res, restaurant.message, restaurant.code);
		});
	}
}

export default new RestaurantController();