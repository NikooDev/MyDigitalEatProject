import mysql, { Pool } from 'mysql2/promise';
import MysqlConfig from '@Src/config/Mysql';
import Handler from '@Core/response/handler';

/**
 * @class MysqlDb
 * @description Cette classe encapsule la logique pour exécuter des requêtes SQL
 * sur une base de données MySQL à l'aide d'un pool de connexions
 */
abstract class MysqlDb {
	private static instance: MysqlDb;
	private pool: Pool;

	protected constructor() {
		this.pool = mysql.createPool(MysqlConfig);
	}

	protected async execute(sql: string, params?: any[]): Promise<any> {
		const connection = await this.pool.getConnection();

		if (!sql) {
			Handler.logger('Aucune requête SQL fournie', 'error');
			return;
		}

		try {
			const row = await connection.execute(sql, params);

			return row[0];
		} catch (error) {
			connection.destroy();
			throw error;
		} finally {
			connection.release();
		}
	}
}

export default MysqlDb;