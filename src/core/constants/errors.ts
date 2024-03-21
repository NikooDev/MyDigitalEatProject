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
	update: {
		name: 'RestaurantController.update() =>',
		error: userErrorUpdate
	},
	delete: {
		name: 'RestaurantController.delete() =>',
		error: userErrorDelete
	}
}

export const middleware = {
	email: {
		name: 'Email.isUniqueEmail() =>',
		error: 'Une erreur interne est survenue'
	}
}