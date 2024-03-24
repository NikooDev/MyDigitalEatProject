import { UserType } from '@Src/interfaces/User';
import MenuType from '@Src/interfaces/Menu';
import ResponseType from '@Src/interfaces/Response';
import Inject from '@Core/service/Inject';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';
import Menu from '@Entities/Menu';
import Handler from '@Core/response/handler';
import RestaurantService from '@Services/RestaurantService';
import DisheService from '@Services/DisheService';

class MenuService extends DaoService<MenuType> {
	@Inject('RestaurantService')
	private restaurantService: RestaurantService;

	constructor() {
		super('menus');
	}

	public async create(entity: MenuType, user?: UserType): Promise<ResponseType<MenuType>> {
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

		// Création du menu
		let newMenu = new Menu({
			card_id: restaurantExist.card_id,
			restaurant_id: restaurantExist.user_id,
			name: entity.name,
			price: entity.price,
			description: entity.description,
			dishes: entity.dishes
		});

		const {dishes, id, ...menu} = newMenu;

		await super.create(menu);

		// Récupération de l'identifiant du menu
		const lastInsertId = await this.select(true, 'LAST_INSERT_ID() AS id')
			.limit(1)
			.run()

		if (lastInsertId && lastInsertId.length === 1 && lastInsertId[0].id !== 0) {
			newMenu.id = lastInsertId[0].id;
		} else {
			Handler.logger('Échec de la récupération du dernier identifiant du menu', 'error');

			return {
				code: 500,
				data: null,
				message: 'Une erreur interne est survenue'
			};
		}

		// Création des plats du menu
		const disheService = new DisheService();

		for (let i = 0; i < entity.dishes.length; i++) {
			const dishe = entity.dishes[i];

			const newDishe = {
				card_id: restaurantExist.card_id,
				restaurant_id: restaurantExist.user_id,
				name: dishe.name,
				price: dishe.price
			};

			const lastInsertId = await disheService.create(newDishe, user);

			if (!lastInsertId.data) {
				Handler.logger('Échec de la récupération du dernier identifiant du plat', 'error');

				return {
					code: 500,
					data: null,
					message: 'Une erreur interne est survenue'
				};
			}

			// Création de la relation entre le menu et le plat
			await this.createMenuDishe(newMenu.id, lastInsertId.data.id);
		}

		return {
			code: 200,
			message: `Le menu ${newMenu.name.toUpperCase()} a bien été créé`,
			data: newMenu
		};
	}

	public async read(): Promise<ResponseType<MenuType[]>> {
		const allMenus = await this.select(false, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
			.selectJoin('menus_dishes', true, false, 'menu_id', 'dishe_id')
			.join('INNER JOIN', 'menus_dishes', 'menus.id', 'menus_dishes.menu_id')
			.selectJoin('dishes', true, false, 'id', 'name', 'price')
			.join('INNER JOIN', 'dishes', 'menus_dishes.dishe_id', 'dishes.id')
			.run();

		if (allMenus.length === 0) {
			return {
				code: 404,
				message: 'Aucun menu trouvé',
				data: []
			};
		}

		const menus = allMenus.map((menu: MenuType) => {
			const menuWithoutMenusDishes = {...menu};
			delete menuWithoutMenusDishes.menus_dishe;
			return menuWithoutMenusDishes;
		});

		return {
			code: 200,
			message: `Liste des menus - ${menus.length} résultats`,
			data: menus
		};
	}

	public async update(entity: Partial<MenuType>, id: string | number): Promise<ResponseType<MenuType>> {
		const menuExists = await this.select(false, 'id', 'card_id', 'restaurant_id', 'name', 'price', 'description')
			.where('menus.id', '=', id)
			.run();
		const menuExist = menuExists[0];

		if (!menuExist) {
			return {
				code: 404,
				data: null,
				message: 'Ce menu n\'existe pas'
			};
		}

		const updateMenu = new Menu({
			id: menuExist.id,
			card_id: menuExist.card_id,
			restaurant_id: menuExist.restaurant_id,
			name: entity.name ?? menuExist.name,
			price: entity.price ?? menuExist.price,
			description: entity.description ?? menuExist.description
		});

		await super.update(updateMenu, id);

		return {
			code: 200,
			data: updateMenu,
			message: 'Le menu a bien été modifié'
		};
	}

	public async delete(id: string): Promise<ResponseType<MenuType>> {
		const menuExists = await this.select(false, 'id')
			.where('id', '=', id)
			.run();
		const menuExist = menuExists[0];

		if (menuExist) {
			await super.delete(id);

			return {
				code: 200,
				data: null,
				message: 'Le menu a bien été supprimé'
			};
		} else {
			return {
				code: 404,
				data: null,
				message: 'Ce menu n\'existe pas'
			};
		}
	}

	public async createMenuDishe(menuId: number, disheId: number) {
		this.query = `INSERT INTO menus_dishes (menu_id, dishe_id)
                  VALUES (?, ?)`;

		return await this.execute(this.query, [menuId, disheId]);
	}
}

Container.register('MenuService', new MenuService());

export default MenuService;