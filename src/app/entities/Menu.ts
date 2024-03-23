import MenuType from '@Src/interfaces/Menu';
import DisheType from '@Src/interfaces/Dishe';

class Menu implements MenuType {
	public id: number;

	public card_id: number;

	public restaurant_id: number;

	public name: string;

	public description: string;

	public price: number;

	/**
	 * @relation ManyToMany
	 * @param dishes
	 */
	public dishes?: DisheType[];

	constructor(menu: MenuType) {
		this.id = menu.id;
		this.card_id = menu.card_id;
		this.restaurant_id = menu.restaurant_id;
		this.name = menu.name;
		this.description = menu.description;
		this.price = menu.price;
	}
}

export default Menu;