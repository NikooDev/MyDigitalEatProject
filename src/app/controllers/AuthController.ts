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

			if (!auth.token) {
				return Handler.exception(res, null, auth.code, auth.error);
			}

			req.user = auth.user;

			return Handler.success(res, 'Vous êtes bien connecté', 200, { user: auth.user, token: auth.token });
		});
	}
}

export default new AuthController();