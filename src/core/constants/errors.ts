export const authController = {
	login: {
		name: 'AuthController.login() =>',
		error: 'Une erreur est survenue lors de la connexion'
	}
}

const userErrorCreate = 'Une erreur est survenue lors de l\'inscription';
const userErrorUpdate = 'Une erreur est survenue lors de la modification de votre compte';
const userErrorDelete = 'Une erreur est survenue lors de la suppression de votre compte';

export const customerController = {
	create: {
		name: 'CustomerController.create() =>',
		error: userErrorCreate
	},
	read: {
		name: 'CustomerController.read() =>',
		error: 'Une erreur est survenue lors de la récupération du client'
	},
	update: {
		name: 'CustomerController.update() =>',
		error: userErrorUpdate
	},
	delete: {
		name: 'CustomerController.delete() =>',
		error: userErrorDelete
	}
}

export const deliverymanController = {
	create: {
		name: 'DeliverymanController.create() =>',
		error: userErrorCreate
	},
	read: {
		name: 'DeliverymanController.read() =>',
		error: 'Une erreur est survenue lors de la récupération du livreur'
	},
	update: {
		name: 'DeliverymanController.update() =>',
		error: userErrorUpdate
	},
	delete: {
		name: 'DeliverymanController.delete() =>',
		error: userErrorDelete
	}
}

export const restaurantController = {
	create: {
		name: 'RestaurantController.create() =>',
		error: userErrorCreate
	},
	read: {
		name: 'RestaurantController.read() =>',
		error: 'Une erreur est survenue lors de la récupération des restaurants'
	},
	update: {
		name: 'RestaurantController.update() =>',
		error: userErrorUpdate
	},
	delete: {
		name: 'RestaurantController.delete() =>',
		error: userErrorDelete
	}
}

export const menuController = {
	create: {
		name: 'MenuController.create() =>',
		error: 'Une erreur est survenue lors de la création du menu'
	},
	read: {
		name: 'MenuController.read() =>',
		error: 'Une erreur est survenue lors de la récupération des menus'
	},
	update: {
		name: 'MenuController.update() =>',
		error: 'Une erreur est survenue lors de la modification du menu'
	},
	delete: {
		name: 'MenuController.delete() =>',
		error: 'Une erreur est survenue lors de la suppression du menu'
	}
}

export const disheController = {
	create: {
		name: 'DisheController.create() =>',
		error: 'Une erreur est survenue lors de la création du plat'
	},
	read: {
		name: 'DisheController.read() =>',
		error: 'Une erreur est survenue lors de la récupération des plats'
	},
	update: {
		name: 'DisheController.update() =>',
		error: 'Une erreur est survenue lors de la modification du plat'
	},
	delete: {
		name: 'DisheController.delete() =>',
		error: 'Une erreur est survenue lors de la suppression du plat'
	}
}

export const deliveryController = {
	create: {
		name: 'DeliveryController.create() =>',
		error: 'Une erreur est survenue lors de la création de la commande'
	},
	read: {
		name: 'DeliveryController.read() =>',
		error: 'Une erreur est survenue lors de la récupération des commandes'
	},
	update: {
		name: 'DeliveryController.update() =>',
		error: 'Une erreur est survenue lors de la modification de la commande'
	},
	delete: {
		name: 'DeliveryController.delete() =>',
		error: 'Une erreur est survenue lors de la suppression de la commande'
	}
}

export const middleware = {
	email: {
		name: 'Email.isUniqueEmail() =>',
		error: 'Une erreur interne est survenue'
	}
}