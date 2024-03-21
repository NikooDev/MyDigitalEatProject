export const authController = {
	login: {
		name: 'AuthController.login() =>',
		error: 'Une erreur est survenue lors de la connexion'
	}
}

export const customerController = {
	create: {
		name: 'CustomerController.create() =>',
		error: 'Une erreur est survenue lors de l\'inscription'
	},
	update: {
		name: 'CustomerController.update() =>',
		error: 'Une erreur est survenue lors de la modification de votre compte'
	},
	delete: {
		name: 'CustomerController.delete() =>',
		error: 'Une erreur est survenue lors de la suppression de votre compte'
	}
}

export const middleware = {
	email: {
		name: 'Email.isUniqueEmail() =>',
		error: 'Une erreur interne est survenue'
	}
}