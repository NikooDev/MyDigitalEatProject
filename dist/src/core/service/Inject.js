"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Container_1 = __importDefault(require("../service/Container"));
/*
|--------------------------------------------------------------------------
| Decorateur @Inject()
|--------------------------------------------------------------------------
|
| Cette fonction prend le nom d'un service en tant que paramètre et renvoie un décorateur qui injectera
| le service spécifié dans la propriété de la classe où il est appliqué.
|
*/
const Inject = (serviceName) => {
    return (target, propertyKey) => {
        const service = Container_1.default.resolve(serviceName);
        if (!service) {
            throw new Error(`Le service ${serviceName} n\'existe pas dans le container`);
        }
        target[propertyKey] = service;
    };
};
exports.default = Inject;
//# sourceMappingURL=Inject.js.map