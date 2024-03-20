import { Request, Response } from 'express';
import Inject from '@Core/service/Inject';
import { authController } from '@Core/constants/errors';
import UserService from '@Services/UserService';
import Handler from '@Core/response/handler';

class AuthController {
	@Inject('UserService')
	private userService: UserService;

	public async login(req: Request, res: Response) {
		const data = req.body;

		await Handler.tryCatch(res, authController.login, async () => {
			const auth = await this.userService.login(data.email, data.password);

			if (!auth.success) {
				return Handler.exception(res, auth.code, auth.error);
			}

			req.user = auth.user;

			return Handler.success(res, 'Vous êtes bien connecté', { user: auth.user, token: auth.token });
		});
	}
}

export default new AuthController();