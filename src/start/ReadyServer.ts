import express, { Express, Router } from 'express';
import { graphqlHTTP } from 'express-graphql';
import SwaggerUI from 'swagger-ui-express';
import SwaggerDocument from '@/api.spec.json';
import Middleware from '@Src/interfaces/Middleware';
import Controller from '@Src/interfaces/Controller';
import {
	AuthController, CustomerController, DeliverymanController, RestaurantController,
	DeliveryController, MenuController, DisheController
} from '@App/controllers';
import {
	MiddlewaresCustomer, MiddlewaresDeliveries, MiddlewaresDeliveryman,
	MiddlewaresDishe, MiddlewaresMenu, MiddlewaresRestaurant
} from '@Middlewares/handler';
import Validator from '@Middlewares/Validator';

class ReadyServer {
	/**
	 * @description Application Express
	 * @private
	 */
	private app: Express;

	/**
	 * @description Routeur Express
	 * @private
	 */
	private route: Router = Router();

	/**
	 * @description Port du serveur
	 * @private
	 */
	private readonly port: number | string;

	constructor() {
		this.app = express();
		this.port = process.env.PORT || 3333;

		this.config();
		this.router();
	}

	/**
	 * @description Démarrage du serveur
	 */
	public start(): Promise<void> {
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
	private config(): void {
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(express.json());
		this.app.set('json spaces', 2);

		// Route DOCS
		this.app.use('/api/docs', SwaggerUI.serve, SwaggerUI.setup(SwaggerDocument));

		// Validation des données selon les paths et les méthodes POST et PUT
		this.app.use('/api/rest', Validator.datas.bind(Validator));

		// Routes REST
		this.app.use('/api/rest', this.route);

		// Routes GRAPHQL
		this.app.use('/api/flex', graphqlHTTP({
			schema: null,
			graphiql: true
		}));
	}

	/**
	 * @description Routeur REST
	 * @private
	 */
	private router(): void {
		this.route.post('/login', [], AuthController.login.bind(AuthController));

		this.crud('/customers', [MiddlewaresCustomer], CustomerController);
		this.crud('/deliverymans', [MiddlewaresDeliveryman], DeliverymanController);
		this.crud('/restaurants', [MiddlewaresRestaurant], RestaurantController);
		this.crud('/deliveries', [MiddlewaresDeliveries], DeliveryController);
		this.crud('/menus', [MiddlewaresMenu], MenuController);
		this.crud('/dishes', [MiddlewaresDishe], DisheController);
	}

	/**
	 * @description Gestion du CRUD pour le routeur REST
	 * @param path
	 * @param middlewares
	 * @param controller
	 * @private
	 */
	private crud(path: string, middlewares: Middleware[], controller: Controller): void {
		this.route.post(
			path, ...middlewares.map(middleware => middleware.post), controller.create.bind(controller)
		);
		this.route.get(
			path, ...middlewares.map(middleware => middleware.get), controller.read.bind(controller)
		);
		this.route.put(
			`${path}/:id`, ...middlewares.map(middleware => middleware.put), controller.update.bind(controller)
		);
		this.route.delete(
			`${path}/:id`, ...middlewares.map(middleware => middleware.delete), controller.delete.bind(controller)
		);
	}
}

export default ReadyServer;