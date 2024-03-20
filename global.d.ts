import { UserType } from '@Src/interfaces/User';

declare global {
	namespace Express {
		interface Request {
			user: UserType
		}
	}
}