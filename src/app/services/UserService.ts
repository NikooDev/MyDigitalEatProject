import { UserType } from '@Src/interfaces/User';
import Jwt, { Secret } from 'jsonwebtoken';
import Bcrypt from 'bcrypt';
import Dotenv from 'dotenv';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';
import ResponseType from '@Src/interfaces/Response';

Dotenv.config();

class UserService extends DaoService<UserType> {
	constructor() {
		super('users');
	}

	public async login(email: string, password: string) {
		const secret: Secret | undefined = process.env.JWT_SECRET;
		const userExists = await this.select(false, 'email', 'password', 'id', 'role', 'created_at')
			.where('email', '=', email)
			.run();
		const user = userExists[0];

		if (!user) {
			return {
				code: 404,
				success: false,
				message: 'Cette adresse e-mail appartient à aucun compte'
			};
		}

		const samePasswords = await Bcrypt.compare(password, user.password);

		// Si les mots de passe sont identiques
		if (samePasswords) {
			const userToken = {
				id: user.id,
				role: user.role,
				created_at: user.created_at
			};

			const token = Jwt.sign(userToken, secret, {
				expiresIn: '30d',
			});

			delete user.password;

			return {
				user,
				token
			};
		} else {
			return {
				code: 401,
				success: false,
				message: 'Vos identifiants sont incorrects'
			};
		}
	}

	public async create(entity: UserType) {
		await super.create(entity);

		const lastInsertId = await this.select(true, 'LAST_INSERT_ID() AS id')
			.limit(1)
			.run();

		if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
			return lastInsertId[0].id;
		}
	}

	public async delete(id: string): Promise<ResponseType<void | UserType>> {
		const userExists = await this.select(false, 'id')
			.where('id', '=', id)
			.run();
		const userExist = userExists[0];

		if (userExist) {
			await super.delete(id);

			return {
				code: 200,
				data: null,
				message: 'L\'utilisateur a bien été supprimé'
			}
		} else {
			return {
				code: 404,
				data: null,
				message: 'Cet utilisateur n\'existe pas'
			}
		}
	}
}

Container.register('UserService', new UserService());

export default UserService;