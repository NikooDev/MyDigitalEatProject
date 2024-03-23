import CardType from '@Src/interfaces/Card';
import DaoService from '@Services/DaoService';
import Container from '@Core/service/Container';

class CardService extends DaoService<CardType> {
	constructor() {
		super('cards');
	}

	public async create(entity: CardType) {
		await super.create(entity);

		const lastInsertId = await this.select(true, 'LAST_INSERT_ID() AS id').run();

		if (lastInsertId && lastInsertId.length > 0 && typeof lastInsertId[0].id !== 'undefined') {
			return lastInsertId[0].id;
		}
	}
}

Container.register('CardService', new CardService());

export default CardService;