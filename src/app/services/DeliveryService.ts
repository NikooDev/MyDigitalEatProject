import DaoService from '@Services/DaoService';
import DeliveryType from '@Src/interfaces/Delivery';
import Container from '@Core/service/Container';

class DeliveryService extends DaoService<DeliveryType> {
	constructor() {
		super('deliveries');
	}
}

Container.register('DeliveryService', new DeliveryService());

export default DeliveryService;