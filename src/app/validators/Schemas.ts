import Joi, { ObjectSchema } from 'joi';


interface Schemas {
	[route: string]: {
		[method: string]: ObjectSchema;
	};
}

const SchemaPostUser = Joi.object({
	email: Joi.string().email().required().messages({
		'string.base': 'L\'adresse e-mail doit être du texte',
		'string.email': 'L\'adresse e-mail est invalide',
		'string.empty': 'L\'adresse e-mail est requise',
		'any.required': 'L\'adresse e-mail est requise'
	}),
	password: Joi.string().required().messages({
		'string.base': 'Le mot de passe doit être du texte',
		'string.min': 'Le mot de passe doit avoir au moins {#limit} caractères',
		'string.max': 'Le mot de passe ne doit pas dépasser {#limit} caractères',
		'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre et un chiffre',
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
		'string.base': 'L\'adresse e-mail doit être du texte',
		'string.email': 'L\'adresse e-mail est invalide'
	}),
	password: Joi.string().optional().messages({
		'string.base': 'Le mot de passe doit être du texte',
		'string.min': 'Le mot de passe doit avoir au moins {#limit} caractères',
		'string.max': 'Le mot de passe ne doit pas dépasser {#limit} caractères',
		'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre et un chiffre',
	}).min(6)
		.max(30)
		.pattern(/^(?=.*[a-zA-Z])(?=.*\d).*$/),
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
			description: Joi.string().required().max(150).messages({
				'string.base': 'La description doit être du texte',
				'string.empty': 'Une description est requise',
				'any.required': 'Une description est requise',
				'string.max': 'La description ne doit pas dépasser {#limit} caractères',
			})
		})
	},
	'/restaurants/{id}': {
		'PUT': SchemaPutUser.keys({
			description: Joi.string().optional().max(150).messages({
				'string.base': 'La description doit être du texte',
				'string.empty': 'Une description est requise',
				'any.required': 'Une description est requise',
				'string.max': 'La description ne doit pas dépasser {#limit} caractères',
			}),
			card: Joi.object({
				description: Joi.string().optional().max(150).messages({
					'string.base': 'La description de la carte doit être du texte',
					'string.empty': 'Une description de la carte est requise',
					'any.required': 'Une description de la carte est requise',
					'string.max': 'La description ne doit pas dépasser {#limit} caractères',
				})
			})
		})
	},
	'/deliveries': {
		'POST': Joi.object({
			restaurant_id: Joi.number().strict().required().messages({
				'number.base': 'Le restaurant doit être un nombre',
				'string.empty': 'Un restaurant est requis',
				'any.required': 'Un restaurant est requis'
			}),
			menus: Joi.array().unique().items(Joi.number().strict().min(1).required().messages({
				'number.empty': 'Au moins un menu est requis',
				'any.required': 'Au moins un menu est requis'
			})).messages({
				'any.required': 'Les menus sont requis',
				'array.base': 'Les menus doivent être une liste',
				'array.unique': 'Les menus doivent être une liste unique',
				'array.includesRequiredUnknowns': 'Les menus doivent être une liste de nombre (id)',
				'number.base': 'Chaque élément de la liste des menus doit être un nombre (id)',
				'number.min': 'Chaque élément de la liste des menus doit contenir au moins un caractère'
			}),
			dishes: Joi.array().unique().items(Joi.number().strict().required().messages({
				'number.empty': 'Au moins un plat est requis',
				'any.required': 'Au moins un plat est requis'
			})).min(1).messages({
				'any.required': 'Les plats sont requis',
				'array.base': 'Les plats doivent être une liste',
				'array.unique': 'Les plats doivent être une liste unique',
				'array.includesRequiredUnknowns': 'Les plats doivent être une liste de nombre (id)',
				'number.base': 'Chaque élément de la liste des plats doit être un nombre (id)',
				'number.min': 'Chaque élément de la liste des plats doit contenir au moins un caractère'
			})
		}).or('menus', 'dishes').messages({
			'object.missing': 'Au moins un menu ou un plat est requis'
		})
	},
	'/menus': {
		'POST': Joi.object({
			name: Joi.string().required().max(30).messages({
				'string.base': 'Le nom du menu doit être du texte',
				'string.empty': 'Un nom de menu est requis',
				'any.required': 'Un nom de menu est requis',
				'string.max': 'Le nom du menu ne doit pas dépasser {#limit} caractères',
			}),
			price: Joi.number().required().messages({
				'number.base': 'Le prix doit être un nombre',
				'string.empty': 'Un prix est requis',
				'any.required': 'Un prix est requis'
			}),
			description: Joi.string().required().messages({
				'string.base': 'La description doit être du texte',
				'string.empty': 'Une description est requise',
				'any.required': 'Une description est requise'
			}),
			dishes: Joi.array().items(
				Joi.object({
					name: Joi.string().required().max(30).messages({
						'any.required': 'Un nom de plat (name) est requis',
						'string.max': 'Le nom du plat ne doit pas dépasser {#limit} caractères',
						'string.base': 'Le nom de plat doit être du texte'
					}),
					price: Joi.number().strict().required().messages({
						'any.required': 'Un prix (price) est requis',
						'number.base': 'Le prix doit être un nombre',
					})
				})
			)
				.min(2)
				.required().messages({
					'object.base': 'Le tableau dishes[] doit contenir au minimum deux objets avec pour propriétés name et price',
					'array.base': 'La propriété dishes[] doit être un tableau',
					'array.min': 'Il doit y avoir au moins {#limit} plats',
					'any.required': 'La propriété dishes[] est requise'
				})
		})
	},
	'/menus/{id}': {
		'PUT': Joi.object({
			name: Joi.string().optional().messages({
				'string.base': 'Le nom du menu doit être du texte',
				'string.empty': 'Un nom de menu est requis',
				'any.required': 'Un nom de menu est requis'
			}),
			price: Joi.number().optional().messages({
				'number.base': 'Le prix doit être un nombre',
				'string.empty': 'Un prix est requis',
				'any.required': 'Un prix est requis'
			}),
			description: Joi.string().optional().messages({
				'string.base': 'La description doit être du texte',
				'string.empty': 'Une description est requise',
				'any.required': 'Une description est requise'
			}),
			dishes: Joi.array().items(
				Joi.object({
					name: Joi.string().optional().messages({
						'any.required': 'Un nom de plat (name) est requis',
						'string.base': 'Le nom de plat doit être du texte'
					}),
					price: Joi.number().strict().optional().messages({
						'any.required': 'Un prix (price) est requis',
						'number.base': 'Le prix doit être un nombre',
					})
				})
			)
				.min(2)
				.optional().messages({
					'object.base': 'Le tableau dishes[] doit contenir au minimum deux objets avec pour propriétés name et price',
					'array.base': 'La propriété dishes[] doit être un tableau',
					'array.min': 'Il doit y avoir au moins {#limit} plats',
					'any.required': 'La propriété dishes[] est requise'
				})
		})
	},
	'/dishes': {
		'POST': Joi.object({
			name: Joi.string().required().max(30).messages({
				'any.required': 'Un nom de plat (name) est requis',
				'string.max': 'Le nom du plat ne doit pas dépasser {#limit} caractères',
				'string.base': 'Le nom de plat doit être du texte'
			}),
			price: Joi.number().strict().required().messages({
				'any.required': 'Un prix (price) est requis',
				'number.base': 'Le prix doit être un nombre',
			}),
			menu_id: Joi.number().strict().optional().messages({
				'number.base': 'menu_id doit être un nombre',
			})
		})
	},
	'/dishes/{id}': {
		'PUT': Joi.object({
			name: Joi.string().optional().max(30).messages({
				'string.base': 'Le nom de plat doit être du texte',
				'string.max': 'Le nom du plat ne doit pas dépasser {#limit} caractères',
			}),
			price: Joi.number().strict().optional().messages({
				'number.base': 'Le prix doit être un nombre',
			}),
			menu_id: Joi.number().strict().optional().messages({
				'number.base': 'menu_id doit être un nombre',
			})
		})
	},
}

export default Schemas;