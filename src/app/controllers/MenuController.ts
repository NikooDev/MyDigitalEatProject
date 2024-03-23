import { Request, Response } from 'express';
import Controller from '@Src/interfaces/Controller';
import { menuController } from '@Core/constants/errors';
import Handler from '@Core/response/handler';
import MenuService from '@Services/MenuService';
import Inject from '@Core/service/Inject';

class MenuController implements Controller {
	@Inject('MenuService')
	private menuService: MenuService;

	public async create(req: Request, res: Response) {
		const data = req.body;
		const user = req.user;

		await Handler.tryCatch(res, menuController.create, async () => {
			const menu = await this.menuService.create(data, user);

			return (Handler[menu.code === 200 ? 'success' : 'exception'])(res, menu.message, menu.code, { menu: menu.data });
		});
	}

	public async read(_: Request, res: Response) {
		await Handler.tryCatch(res, menuController.read, async () => {
			const menus = await this.menuService.read();

			return (Handler[menus.code === 200 ? 'success' : 'exception'])(res, menus.message, menus.code, { menus: menus.data });
		});
	}

	public async update(req: Request, res: Response) {
		const data = req.body;
		const params = req.params;

		await Handler.tryCatch(res, menuController.update, async () => {
			const menus = await this.menuService.update(data, params.id);

			return (Handler[menus.code === 200 ? 'success' : 'exception'])(res, menus.message, menus.code, { menus: menus.data });
		});
	}

	public async delete(req: Request, res: Response) {
		const params = req.params;

		await Handler.tryCatch(res, menuController.update, async () => {
			const menus = await this.menuService.delete(params.id);

			return (Handler[menus.code === 200 ? 'success' : 'exception'])(res, menus.message, menus.code);
		});
	}
}

export default new MenuController();