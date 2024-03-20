import { NextFunction, Request, Response } from 'express';
import Schemas from '@Validators/Schemas';
import Handler from '@Core/response/handler';

/**
 * @class Validator
 * @description Validation générique des données de toutes les routes
 */
class Validator {
	public datas(req: Request, res: Response, next: NextFunction) {
		const route = req.path;
		const method = req.method;
		const paramsRoute = req.path.split('/')[1];
		const params = req.path.split('/')[2];
		const schema = params ? Schemas[`/${paramsRoute}/{id}`][method] : Schemas[route][method];

		if (!schema) {
			return next();
		}

		const { error } = schema.validate(req.body);

		if (error) {
			return Handler.exception(res, 422, error.details[0].message);
		}

		next();
	}
}

export default new Validator();