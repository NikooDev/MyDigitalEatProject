import Joi, { ObjectSchema } from 'joi';


interface Schemas {
	[route: string]: {
		[method: string]: ObjectSchema<any>;
	};
}

const SchemaPostUser = Joi.object({
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
});

const SchemaPutUser = Joi.object({
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
});

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
		'POST': SchemaPostUser
	},
	'/customers/{id}': {
		'PUT': SchemaPutUser
	},
	'/deliverymans': {
		'POST': SchemaPostUser
	},
	'/deliverymans/{id}': {
		'PUT': SchemaPutUser
	},
	'/restaurants': {
		'POST': SchemaPostUser.keys({
			description: Joi.string().required().messages({
				'string.base': 'La description doit être du texte',
				'string.empty': 'Une description est requise',
				'any.required': 'Une description est requise'
			})
		})
	},
	'/restaurants/{id}': {
		'PUT': SchemaPutUser
	},
}

export default Schemas;