import DisheType from '@Src/interfaces/Dishe';
import ResponseType from '@Src/interfaces/Response';
import { UserType } from '@Src/interfaces/User';
import Inject from '@Core/service/Inject';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';
import Dishe from '@Entities/Dishe';
import Handler from '@Core/response/handler';
import RestaurantService from '@Services/RestaurantService';
import MenuService from '@Services/MenuService';

class DisheService extends DaoService<DisheType> {
	@Inject('RestaurantService')
	private restaurantService: RestaurantService;

	constructor() {
		super('dishes');
	}

	public async create(entity: DisheType & { menu_id?: number }, user?: UserType): Promise<ResponseType<DisheType>> {
		if (!user) {
			return {
				code: 403,
				message: 'Accès refusé, veuillez-vous authentifier',
				data: null
			};
		}

		// Vérifier si le restaurant existe
		const restaurantExists = await this.restaurantService.all()
			.where('user_id', '=', user.id)
			.run();
		const restaurantExist = restaurantExists[0];

		if (!restaurantExist.card_id) {
			return {
				code: 404,
				message: `Votre restaurant ne possède pas de carte. Vous pouvez en créer une en modifiant votre restaurant.`,
				data: null
			};
		}

		let newDishe = new Dishe({
			card_id: restaurantExist.card_id,
			restaurant_id: restaurantExist.user_id,
			name: entity.name,
			price: entity.price
		});

		const {id, ...dishe} = newDishe;

		await super.create(dishe);

		const lastInsertId = await this.select(true, 'LAST_INSERT_ID() AS id')
			.limit(1)
			.run();

		if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
			newDishe.id = lastInsertId[0].id;
		} else {
			Handler.logger('Échec de la récupération du dernier identifiant du plat', 'error');

			return {
				code: 500,
				data: null,
				message: 'Une erreur interne est survenue'
			};
		}

		// Rattacher le plat à un menu
		if (entity.menu_id) {
			/**
			 * Pour éviter les dépendances cycliques,
			 * j'instancie le service MenuService à l'intérieur de la méthode create
			 */
			const menuService = new MenuService();
			const menuExists = await menuService.select(false, 'id', 'name')
				.where('id', '=', entity.menu_id)
				.run();
			const menuExist = menuExists[0];

			if (!menuExist) {
				return {
					code: 404,
					message: `Le menu id=${entity.menu_id.toString()} n'existe pas`,
					data: null
				};
			}

			const menuDishe = {
				menu_id: menuExist.id,
				dishe_id: newDishe.id
			};

			await menuService.createMenuDishe(menuDishe.menu_id, menuDishe.dishe_id);

			return {
				data: newDishe,
				code: 200,
				message: `Le plat ${newDishe.name.toUpperCase()} a bien été créé dans le menu ${menuExist.name.toUpperCase()}`
			}
		}

		return {
			data: newDishe,
			code: 200,
			message: `Le plat ${newDishe.name.toUpperCase()} a bien été créé`
		};
	}

	public async read(): Promise<ResponseType<DisheType[]>> {
		const dishes = await this.all().run();

		return {
			code: 200,
			data: dishes,
			message: `Liste des plats - ${dishes.length} résultats`
		}
	}

	public async update(entity: Partial<DisheType & { menu_id?: number }>, id: string | number): Promise<ResponseType<DisheType>> {
		const disheExists = await this.select(false, 'id', 'card_id', 'restaurant_id', 'name', 'price')
			.where('id', '=', id)
			.run();
		const disheExist = disheExists[0];

		if (!disheExist) {
			return {
				code: 404,
				data: null,
				message: 'Ce plat n\'existe pas'
			};
		}

		let newDishe = new Dishe({
			card_id: disheExist.card_id,
			restaurant_id: disheExist.restaurant_id,
			name: entity.name,
			price: entity.price
		});

		await super.update(newDishe, id);

		// Réassigner un plat à un menu appartenant au restaurant connecté
		if (entity.menu_id) {
			const menuService = new MenuService();
			const menuExists = await menuService.select(false, 'id', 'name')
				.where('id', '=', entity.menu_id)
				.andWhere('restaurant_id', '=', disheExist.restaurant_id)
				.run();
			const menuExist = menuExists[0];

			if (!menuExist) {
				return {
					code: 404,
					message: `Le menu id=${entity.menu_id.toString()} n'existe pas ou ne vous appartient pas`,
					data: null
				};
			}

			const menuDishe = {
				menu_id: menuExist.id,
				dishe_id: disheExist.id
			};

			await menuService.createMenuDishe(menuDishe.menu_id, menuDishe.dishe_id);

			return {
				code: 200,
				data: disheExist,
				message: `Le plat ${disheExist.name.toUpperCase()} a bien été modifié dans le menu ${menuExist.name.toUpperCase()}`
			}
		}

		return {
			code: 200,
			data: disheExist,
			message: 'Le plat a bien été modifié'
		}
	}

	public async delete(id: string): Promise<ResponseType<DisheType>> {
		const disheExists = await this.select(false, 'id')
			.where('id', '=', id)
			.run();
		const disheExist = disheExists[0];

		if (disheExist) {
			await super.delete(id);

			return {
				code: 200,
				data: null,
				message: 'Le plat a bien été supprimé'
			};
		} else {
			return {
				code: 404,
				data: null,
				message: 'Ce plat n\'existe pas'
			};
		}
	}
}

Container.register('DisheService', new DisheService());

export default DisheService;