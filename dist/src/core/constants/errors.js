"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.middleware = exports.deliveryController = exports.disheController = exports.menuController = exports.restaurantController = exports.deliverymanController = exports.customerController = exports.authController = void 0;
exports.authController = {
    login: {
        name: 'AuthController.login() =>',
        error: 'Une erreur est survenue lors de la connexion'
    }
};
const userErrorCreate = 'Une erreur est survenue lors de l\'inscription';
const userErrorUpdate = 'Une erreur est survenue lors de la modification de votre compte';
const userErrorDelete = 'Une erreur est survenue lors de la suppression de votre compte';
exports.customerController = {
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
};
exports.deliverymanController = {
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
};
exports.restaurantController = {
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
};
exports.menuController = {
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
};
exports.disheController = {
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
};
exports.deliveryController = {
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
};
exports.middleware = {
    email: {
        name: 'Email.isUniqueEmail() =>',
        error: 'Une erreur interne est survenue'
    }
};
//# sourceMappingURL=errors.js.map