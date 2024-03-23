/*
|--------------------------------------------------------------------------
| Container de services
|--------------------------------------------------------------------------
|
| Cette classe représente un conteneur d'injection de dépendance simplifié
| Cela permet de centraliser les services en isolant la création et la résolution des dépendances dans ce conteneur
|
*/

class Container {
	private static services: Map<string, any> = new Map();

	public static register(name: string, service: any) {
		this.services.set(name, service);
	}

	public static resolve<T>(name: string): T {
		return Container.services.get(name);
	}
}

export default Container;