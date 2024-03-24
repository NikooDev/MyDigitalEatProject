"use strict";
/*
|--------------------------------------------------------------------------
| Container de services
|--------------------------------------------------------------------------
|
| Cette classe représente un conteneur d'injection de dépendance simplifié
| Cela permet de centraliser les services en isolant la création et la résolution des dépendances dans ce conteneur
|
*/
Object.defineProperty(exports, "__esModule", { value: true });
class Container {
    static register(name, service) {
        this.services.set(name, service);
    }
    static resolve(name) {
        return Container.services.get(name);
    }
}
Container.services = new Map();
exports.default = Container;
//# sourceMappingURL=Container.js.map