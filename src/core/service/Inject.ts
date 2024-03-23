import Container from '@Core/service/Container';
import InjectType from '@Src/interfaces/Inject';

/*
|--------------------------------------------------------------------------
| Decorateur @Inject()
|--------------------------------------------------------------------------
|
| Cette fonction prend le nom d'un service en tant que paramètre et renvoie un décorateur qui injectera
| le service spécifié dans la propriété de la classe où il est appliqué.
|
*/

const Inject = (serviceName: string): InjectType['decorator'] => {
	return (target: any, propertyKey: string | symbol) => {
		const service = Container.resolve(serviceName);

		if (!service) {
			throw new Error(`Le service ${serviceName} n\'existe pas dans le container`);
		}

		target[propertyKey] = service;
	};
}

export default Inject;