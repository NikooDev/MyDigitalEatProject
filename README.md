
# API MyDigitalEatProject
API pour la gestion de livraisons et de commandes


## Structure du projet
API créée avec ExpressJS, MySQL, sans ORM


## Installation

Cloner le repo
Dans le dossier :
```bash
yarn install
```

Mode développement :
```bash
yarn run dev
```

Mode production :
```bash
yarn run build
```
```bash
yarn run start
```

Le fichier tables.sql, contient toutes les tables SQL du projet.
Configurez le fichier .env pour adapter votre configuration à la base de données MySQL.

### Architecture de l'API

* src/
    * app/ : Répertoire de la logique de l'application
        * controllers/ : Contrôleurs REST
        * entities/ : Entités du projet
        * graphql/ : Répertoire destiné à graphql
        * middlewares/ : Tous les middlewares du projet
        * services/ : L'accès à la base de données via les services DAO
        * validators/ : Le schéma de validation des données
    * config/ : Fichiers de configuration
    * core/ : Fichiers nécessaire au fonctionnement interne de l'API
    * database/ : Gestionnaire de requête, connexion à la base de données
    * interfaces/ : Interfaces et types du projet
    * start/ : Fichier de démarrage pour lancer le serveur
* server.ts

### Gestionnaire de requêtes

Pour rendre les accès aux données modulables, j'ai créé un générateur de requête accessible dans dabatase/mysql/Mananer.ts : 

Exemple de select :
```javascript
const data = await this.userService.select('id', 'name', 'email')
    .where('users.id', '=', user.id)
    .limit(1)
    .orderBy('created_at', 'DESC')
    .run();
```

Exemple de jointure :
```javascript
const data = await this.userService.select('id', 'name', 'email')
    .selectJoin('tableSelect1', 'id', 'role', 'status')
    .join('LEFT JOIN', 'tableSelect1', 'id', '=', 'tableSelect.id')
    .selectJoin('tableSelect2', 'id', 'role', 'status')
    .join('LEFT JOIN', 'tableSelect2', 'id', '=', 'tableSelect.id')
    .where('users.id', '=', user.id)
    .andWhere('tableSelect1.status', '=', tableSelect2.status)
    .orWhere('tableSelect2.id', '=', user.id)
    .groupBy('id')
    .run();
```

### Injection de dépendances

Les services DAO sont des classes d'accès aux données via le générateur de requêtes SQL.
J'ai créé un injecteur de dépendance simplifié pour répondre au problème d'injection de service dans les classes :

```javascript
const Inject = (serviceName: string): InjectType['decorator'] => {
	return (target: any, propertyKey: string | symbol) => {
		const service = Container.resolve(serviceName);

		if (!service) {
			throw new Error(`Le service ${serviceName} n\'existe pas dans le container`);
		}

		target[propertyKey] = service;
	};
}

class Container {
	private static services: Map<string, any> = new Map();

	public static register(name: string, service: any) {
		this.services.set(name, service);
	}

	public static resolve<T>(name: string): T {
		return Container.services.get(name);
	}
}

Container.register('UserService', new UserService());
```

```javascript
@Inject('UserService')
private userService: UserService
```

Le container se charge d'inscrire chaque service en tant que dépendance et le décorateur permet d'injecter ces dépendances dans les classes TypeScript

### Jetons JWT

Authentification REST et GraphQL grâce aux jetons JWT :

Dans le cas de GraphQL, le token est transmis entre les resolvers grâce à un dataloaders
```javascript
this.app.use('/api/flex', (req, res) => {
	graphqlHTTP({
		schema: Schema,
		graphiql: true,
		context: { req, dataloaders: DataLoader }
	})(req, res);
});
```

Pour REST, l'utilisateur est stocké dans req.user au moment de la connexion, ce qui permet de conserver l'authentification même côté serveur
