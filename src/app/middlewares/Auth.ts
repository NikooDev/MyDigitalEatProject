import { NextFunction, Request, Response } from 'express';
import Jwt, { Secret } from 'jsonwebtoken';
import MenuType from '@Src/interfaces/Menu';
import DisheType from '@Src/interfaces/Dishe';
import { RoleEnum, UserType } from '@Src/interfaces/User';
import UserService from '@Services/UserService';
import MenuService from '@Services/MenuService';
import DisheService from '@Services/DisheService';
import Handler from '@Core/response/handler';
import Inject from '@Core/service/Inject';
import Dotenv from 'dotenv';
import DeliveryService from '@Services/DeliveryService';
import DeliveryType from '@Src/interfaces/Delivery';

Dotenv.config();

/**
 * @Class Auth
 * @description Vérifie l'authentification de l'utilisateur
 * Vérifie si l'utilisateur a bien un rôle défini
 */
class Auth {
	@Inject('UserService')
	private static userService: UserService;

	@Inject('DeliveryService')
	private static deliveryService: DeliveryService;

	@Inject('MenuService')
	private static menuService: MenuService;

	@Inject('DisheService')
	private static disheService: DisheService;

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
				code = 401;
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
				let roleString: string, roleUser: string;

				switch (req.user.role) {
					case RoleEnum.CUSTOMER:
						roleUser = 'client';
						break;
					case RoleEnum.RESTAURANT:
						roleUser = 'restaurant';
						break;
					case RoleEnum.DELIVERYMAN:
						roleUser = 'livreur';
						break;
					default:
						break;
				}

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

				return Auth.handler(res, roleString, roleUser);
			}
		};
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

	private static handler = (res: Response, role?: string, currentRole?: string) => {
		return Handler.exception(
			res,
			role
				? `Accès refusé, vous êtes un ${currentRole}. Vérifiez si vous êtes authentifié avec le bon token et si vous êtes bien un ${role}`
				: 'Accès refusé',
			403
		);
	};

	private static async nextParams(req: Request, res: Response, next: NextFunction) {
		const entity = req.path.split('/')[1] as 'customers' | 'deliverymans' | 'restaurants' | 'deliveries' | 'menus' | 'dishes';

		// Pour chaque route, je vérifie l'authenticité de l'utilisateur

		if (req.params.id) {
			switch (entity) {
				case 'customers':
				case 'deliverymans':
				case 'restaurants':
					// Vérifie si l'utilisateur existe
					if ((req.user && (req.user.id.toString() === req.params.id))) {
						return next();
					} else {
						const userExists = await this.userService.select(true, 'COUNT(id) as count_id')
							.where('id', '=', req.params.id)
							.run();
						const userExist = userExists[0] as UserType & { count_id: number };

						return Auth.nextParamsUsersError(res, userExist.count_id);
					}
				case 'deliveries':
					// Vérifie si la livraison existe
					const deliveryExists = await this.deliveryService.select(true, 'COUNT(deliveries.id) as count_id')
						.where('id', '=', req.params.id)
						.andWhere('restaurant_id', '=', req.user.id)
						.orWhere('customer_id', '=', req.user.id)
						.run();
					const deliveryExist = deliveryExists[0] as DeliveryType & { count_id: number };

					if (deliveryExist && deliveryExist.count_id > 0) {
						next();
					} else {
						return Auth.nextParamsError(res, 'Cette commande n\'existe pas ou vous n\'avez pas l\'autorisation nécessaire');
					}
					break;
				case 'menus':
					// Vérifie si le menu existe et que le restaurant est bien le propriétaire
					const menuExists = await this.menuService.select(true, 'COUNT(menus.id) as count_id')
						.where('id', '=', req.params.id)
						.andWhere('restaurant_id', '=', req.user.id)
						.run();
					const menuExist = menuExists[0] as MenuType & { count_id: number };

					if (menuExist && menuExist.count_id > 0) {
						next();
					} else {
						return Auth.nextParamsError(res, 'Ce menu n\'existe pas ou vous n\'avez pas l\'autorisation nécessaire');
					}
					break;
				case 'dishes':
					// Vérifie si le plat existe et que le restaurant est bien le propriétaire
					const disheExists = await this.disheService.select(true, 'COUNT(dishes.id) as count_id')
						.where('id', '=', req.params.id)
						.andWhere('restaurant_id', '=', req.user.id)
						.run();
					const disheExist = disheExists[0] as DisheType & { count_id: number };

					if (disheExist && disheExist.count_id > 0) {
						next();
					} else {
						return Auth.nextParamsError(res, 'Ce plat n\'existe pas ou vous n\'avez pas l\'autorisation nécessaire');
					}
					break;
			}
		} else {
			return next();
		}
	}

	public static nextParamsUsersError(res: Response, count_id: number) {
		let message: string, code: number;

		if (count_id > 0) {
			message = 'Accès refusé, vous n\'avez pas l\'autorisation nécessaire';
			code = 403;
		} else {
			message = 'L\'utilisateur n\'existe pas';
			code = 404;
		}

		return Handler.exception(res, message, code);
	}

	public static nextParamsError(res: Response, message: string) {
		return Handler.exception(res, message, 403);
	}
}

export default new Auth();