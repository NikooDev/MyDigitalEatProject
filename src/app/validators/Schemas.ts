import Joi, { ObjectSchema } from 'joi';


interface Schemas {
	[route: string]: {
		[method: string]: ObjectSchema<any>;
	};
}

const Schemas: Schemas = {
	'/login': {
		'POST': Joi.object({
			email: Joi.string().email().required().messages({
				'string.email': 'L\'adresse e-mail est invalide',
				'string.empty': 'L\'adresse e-mail est requise',
				'any.required': 'L\'adresse e-mail est requise'
			}),
			password: Joi.string().required().messages({
				'string.empty': 'Un mot de passe est requis',
				'any.required': 'Un mot de passe est requis'
			})
		})
	},
	'/customers': {
		'POST': Joi.object({
			email: Joi.string().email().required().messages({
				'string.email': 'L\'adresse e-mail est invalide',
				'string.empty': 'L\'adresse e-mail est requise',
				'any.required': 'L\'adresse e-mail est requise'
			}),
			password: Joi.string().required().messages({
				'string.empty': 'Un mot de passe est requis',
				'any.required': 'Un mot de passe est requis'
			}).min(6)
				.max(30)
				.pattern(/^(?=.*[a-zA-Z])(?=.*\d).*$/),
			name: Joi.string().required().messages({
				'string.empty': 'Un nom est requis',
				'any.required': 'Un nom est requis'
			}),
			address: Joi.string().required().messages({
				'string.empty': 'Une adresse est requise',
				'any.required': 'Une adresse est requise'
			}),
			phone: Joi.string().required().messages({
				'string.empty': 'Un numéro de téléphone est requis',
				'any.required': 'Un numéro de téléphone est requis'
			})
		})
	},
	'/customers/{id}': {
		'PUT': Joi.object({
			email: Joi.string().email().optional().messages({
				'string.email': 'L\'adresse e-mail est invalide',
			}),
			password: Joi.string().optional().messages({
				'string.empty': 'Un mot de passe est requis',
				'any.required': 'Un mot de passe est requis'
			}),
			name: Joi.string().optional().messages({
				'string.base': 'Le prénom doit être du texte'
			}),
			address: Joi.string().optional().messages({
				'string.base': 'L\'adresse doit être du texte'
			}),
			phone: Joi.string().optional().messages({
				'string.base': 'Le numéro de téléphone doit être du texte'
			})
		})
	},
	'/restaurants': {
		'POST': Joi.object({

		}),
		'PUT': Joi.object({

		})
	},
	'/deliverymans': {
		'POST': Joi.object({

		}),
		'PUT': Joi.object({

		})
	}
}

export default Schemas;