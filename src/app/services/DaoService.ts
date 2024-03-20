import MysqlManager from '@Src/database/mysql/Manager';

/*
|--------------------------------------------------------------------------
| Service DAO abstrait
|--------------------------------------------------------------------------
|
| Cette classe abstraite fournit une base pour la création de classes DAO (Services) spécifiques
| à différents types d'entités dans l'application
|
*/

/**
 * @class DaoService
 * @extends MysqlManager
 * @abstract
 */
class DaoService<T> extends MysqlManager<T> {
	protected constructor(table: string) {
		super(table);
	}
}

export default DaoService;