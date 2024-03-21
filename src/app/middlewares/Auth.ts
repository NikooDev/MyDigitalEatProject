import { NextFunction, Request, Response } from 'express';
import Jwt, { Secret } from 'jsonwebtoken';
import { RoleEnum, UserType } from '@Src/interfaces/User';
import UserService from '@Services/UserService';
import Handler from '@Core/response/handler';
import Dotenv from 'dotenv';
import Inject from '@Core/service/Inject';

Dotenv.config();

/**
 * @Class Auth
 * @description Vérifie l'authentification de l'utilisateur
 * Vérifie si l'utilisateur a bien un rôle défini
 */
class Auth {
	@Inject('UserService')
	private static userService: UserService;

	public async isAuth(req: Request, res: Response, next: NextFunction) {
		const authorizationHeader = req.headers['authorization'];

		if (!authorizationHeader) {
			return Handler.exception(res, 'Accès refusé, un token est requis pour accéder à ce contenu', 401);
		}

		const token = authorizationHeader.split(' ')[1];
		const secret: Secret | undefined = process.env.JWT_SECRET;

		try {
			const userDecoded = Jwt.verify(token.toString(), secret);

			req.user = userDecoded as UserType;

			return next();
		} catch (err) {
			err instanceof Error && Handler.logger(err.message, 'error');

			let message: string, code: number;

			if (err instanceof Jwt.TokenExpiredError) {
				code = 403;
				message = 'Accès refusé, le token a expiré, veuillez-vous authentifier à nouveau';
			} else if (err instanceof Jwt.JsonWebTokenError) {
				code = 403;
				message = 'Accès refusé, veuillez-vous authentifier';
			} else {
				code = 401
				message = 'Accès refusé, le token est invalide';
			}

			return Handler.exception(res, message, code);
		}
	}

	public isRole(role: RoleEnum) {
		return async (req: Request, res: Response, next: NextFunction) => {
			if (req.user && req.user.role === role) {
				await Auth.nextParams(req, res, next);
			} else {
				let roleString: string;

				switch (role) {
					case RoleEnum.CUSTOMER:
						roleString = 'client';
						break;
					case RoleEnum.RESTAURANT:
						roleString = 'restaurant';
						break;
					case RoleEnum.DELIVERYMAN:
						roleString = 'livreur';
						break;
					default:
						break;
				}

				return Auth.handler(res, roleString);
			}
		}
	}

	public isAll(req: Request, res: Response, next: NextFunction) {
		if ((req.user && (req.user.role == RoleEnum.CUSTOMER)
			|| (req.user.role == RoleEnum.RESTAURANT)
			|| (req.user.role == RoleEnum.DELIVERYMAN))
		) {
			return Auth.nextParams(req, res, next);
		} else {
			return Auth.handler(res);
		}
	}

	public isCustomerOrRestaurant(req: Request, res: Response, next: NextFunction) {
		if ((req.user && (req.user.role == RoleEnum.CUSTOMER)
			|| (req.user.role == RoleEnum.RESTAURANT))
		) {
			return Auth.nextParams(req, res, next);
		} else {
			return Auth.handler(res, 'client ou un restaurant');
		}
	}

	private static handler = (res: Response, role?: string) => {
		return Handler.exception(
			res,
			role
				? `Accès refusé, vérifiez si vous êtes authentifié avec le bon token et si vous êtes bien un ${role}`
				: 'Accès refusé',
			403
		);
	}

	private static async nextParams(req: Request, res: Response, next: NextFunction) {
		if (req.params.id) {
			if ((req.user && (req.user.id.toString() === req.params.id))) {
				return next();
			} else {
				const userExists = await this.userService.select(true, 'COUNT(id) as count_id')
					.where('id', '=', req.params.id)
					.run();

				const userExist = userExists[0] as UserType & { count_id: number };
				let message: string, code: number;

				if (userExist.count_id > 0) {
					message = 'Accès refusé, vous n\'avez pas l\'autorisation nécessaire';
					code = 403;
				} else {
					message = 'L\'utilisateur n\'existe pas';
					code = 404;
				}

				return Handler.exception(res, message, code);
			}
		} else {
			return next();
		}
	}
}

export default new Auth();