import MenuType from '@Src/interfaces/Menu';

class Menu implements MenuType {
	public card_id: number;

	public name: string;

	public description: string;

	public price: number;

	constructor(menu: MenuType) {
		this.card_id = menu.card_id;
		this.name = menu.name;
		this.description = menu.description;
		this.price = menu.price;
	}
}

export default Menu;