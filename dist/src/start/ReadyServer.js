"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const express_graphql_1 = require("express-graphql");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const api_spec_json_1 = __importDefault(require("../../api.spec.json"));
const controllers_1 = require("../app/controllers");
const Handler_1 = require("../app/middlewares/Handler");
const schemas_1 = __importDefault(require("../app/graphql/schemas"));
const dataloader_1 = __importDefault(require("dataloader"));
class ReadyServer {
    constructor() {
        /**
         * @description Routeur Express
         * @private
         */
        this.route = (0, express_1.Router)();
        this.app = (0, express_1.default)();
        this.port = process.env.PORT || 3333;
        this.config();
        this.router();
    }
    /**
     * @description Démarrage du serveur
     */
    start() {
        return new Promise((resolve, reject) => {
            this.app.listen(this.port, () => {
                console.log(`Serveur démarré sur http://localhost:${this.port}`);
                resolve();
            }).on('error', (err) => {
                console.error('Erreur serveur :', err.message);
                reject(err);
            });
        });
    }
    /**
     * @description Configuration d'Express
     * @private
     */
    config() {
        this.app.use(express_1.default.urlencoded({ extended: false }));
        this.app.use(express_1.default.json());
        this.app.set('json spaces', 2);
        // Route DOCS
        this.app.use('/api/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(api_spec_json_1.default));
        // Routes REST
        this.app.use('/api/rest', this.route);
        // Routes GRAPHQL
        this.app.use('/api/flex', (req, res) => {
            (0, express_graphql_1.graphqlHTTP)({
                schema: schemas_1.default,
                graphiql: true,
                context: { req, dataloaders: dataloader_1.default }
            })(req, res);
        });
    }
    /**
     * @description Routeur REST
     * @private
     */
    router() {
        this.route.post('/login', [], controllers_1.AuthController.login.bind(controllers_1.AuthController));
        this.crud('/customers', [Handler_1.MiddlewaresCustomer], controllers_1.CustomerController);
        this.crud('/deliverymans', [Handler_1.MiddlewaresDeliveryman], controllers_1.DeliverymanController);
        this.crud('/restaurants', [Handler_1.MiddlewaresRestaurant], controllers_1.RestaurantController);
        this.crud('/deliveries', [Handler_1.MiddlewaresDeliveries], controllers_1.DeliveryController);
        this.crud('/menus', [Handler_1.MiddlewaresMenu], controllers_1.MenuController);
        this.crud('/dishes', [Handler_1.MiddlewaresDishe], controllers_1.DisheController);
    }
    /**
     * @description Gestion du CRUD pour le routeur REST
     * @param path
     * @param middlewares
     * @param controller
     * @private
     */
    crud(path, middlewares, controller) {
        this.route.post(path, ...middlewares.map(middleware => middleware.post), controller.create.bind(controller));
        this.route.get(path, ...middlewares.map(middleware => middleware.get), controller.read.bind(controller));
        this.route.put(`${path}/:id`, ...middlewares.map(middleware => middleware.put), controller.update.bind(controller));
        this.route.delete(`${path}/:id`, ...middlewares.map(middleware => middleware.delete), controller.delete.bind(controller));
    }
}
exports.default = ReadyServer;
//# sourceMappingURL=ReadyServer.js.map