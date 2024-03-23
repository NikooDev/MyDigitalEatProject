import DisheType from '@Src/interfaces/Dishe';

interface MenuDisheType {
	menu_id: number
	dishe_id: number
}

interface MenuType {
	id?: number
	card_id: number
	restaurant_id: number
	name: string
	price: number
	description: string
	menus_dishe?: MenuDisheType[];
	dishes?: DisheType[]
}

export default MenuType;