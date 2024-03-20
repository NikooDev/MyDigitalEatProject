import { UserType } from '@Src/interfaces/User';
import Bcrypt from 'bcrypt';

/**
 * @model User
 * @description Ajoute un objet "user" imbriqué à son modèle parent selon la relation OneToOne
 * @abstract
 */
abstract class User {
	public user: UserType

	protected constructor(user: UserType) {
		this.user = user;
	}

	public async hashPassword (password: string) {
		if (password) {
			this.user.password = await Bcrypt.hash(password, 10);
		}
	}
}

export default User;