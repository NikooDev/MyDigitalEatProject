import { UserType } from '@Src/interfaces/User';
import Jwt, { Secret } from 'jsonwebtoken';
import Bcrypt from 'bcrypt';
import Dotenv from 'dotenv';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';

Dotenv.config();

class UserService extends DaoService<UserType> {
	constructor() {
		super('users');
	}

	public async login(email: string, password: string) {
		const secret: Secret | undefined = process.env.JWT_SECRET;
		const userExist = await this.select('email', 'password').where('email', '=', email).run();

		if (userExist.length === 0) {
			return {
				code: 404,
				success: false,
				error: 'Cette adresse e-mail appartient à aucun compte'
			};
		}

		const user = userExist[0];
		const samePasswords = await Bcrypt.compare(password, user.password);

		// Si les mots de passe sont identiques
		if (samePasswords) {
			const userToken = {
				uid: user.id,
				role: user.role
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
				error: 'Vos identifiants sont incorrects'
			};
		}
	}



	public async create(entity: UserType) {
		await super.create(entity);

		const lastInsertId = await this.execute('SELECT LAST_INSERT_ID() AS id');

		if (lastInsertId && lastInsertId.length > 0 && typeof lastInsertId[0].id !== 'undefined') {
			return lastInsertId[0].id;
		} else {
			throw new Error('Échec de la récupération du dernier identifiant');
		}
	}
}

Container.register('UserService', new UserService());

export default UserService;