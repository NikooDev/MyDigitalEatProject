import { NextFunction, Request, Response } from 'express';
import { UserType } from '@Src/interfaces/User';
import { middleware } from '@Core/constants/errors';
import Handler from '@Core/response/handler';
import UserService from '@Services/UserService';
import Inject from '@Core/service/Inject';

/**
 * @Class Email
 * @description Vérifie l'unicité d'une adresse e-mail
 */
class Email {
	@Inject('UserService')
	private userService: UserService;

	public async isUnique(req: Request, res: Response, next: NextFunction) {
		const userEmail = req.body.email;

		if (!userEmail) {
			return next();
		}

		await Handler.tryCatch(res, middleware.email, async () => {

			// Je retourne next() si l'utilisateur ne modifie pas son adresse e-mail
			if (req.user && req.user.id) {
				const userExists = await this.userService
					.select(false, 'id', 'email')
					.where('id', '=', req.user.id.toString())
					.andWhere('email', '=', userEmail)
					.run();

				const userExist = userExists[0];

				if (userExist && userExist.email && userExist.email === userEmail) {
					return next();
				}
			}

			// Je vérifie si l'adresse e-mail existe déjà
			const emailExists = await this.userService
				.select(true, 'COUNT(email) AS email_count')
				.where('email', '=', userEmail)
				.run() as UserType[] & UserType & { email_count: number }[];

			const emails = emailExists[0];

			if (emails.email_count > 0) {
				return Handler.exception(res, 'Cette adresse e-mail est déjà utilisée', 409);
			}

			next();
		});
	}
}

export default new Email();