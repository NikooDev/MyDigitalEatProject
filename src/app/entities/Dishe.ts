import DisheType from '@Src/interfaces/Dishe';

class Dishe implements DisheType {
	public id: number;

	public card_id: number;

	public name: string;

	public price: number;

	constructor(dishe: DisheType) {
		this.id = dishe.id;
		this.card_id = dishe.card_id;
		this.name = dishe.name;
		this.price = dishe.price;
	}
}

export default Dishe;