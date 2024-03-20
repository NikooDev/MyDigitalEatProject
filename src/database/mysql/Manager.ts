import Builder from '@Src/database/mysql/Builder';
import { WhereOperatorType } from '@Src/interfaces/Manager';

/**
 * @class MysqlManager
 * @extends Builder
 * @description Gestionnaire de requêtes MySQL
 * @abstract
 */
abstract class MysqlManager<T> extends Builder<T> {
	protected tableName: string;

	protected constructor(table: string) {
		super();

		this.queryStart = 'SELECT ';
		this.queryFrom 	= 'FROM '+table;
		this.queryEnd 	= '';

		this.tableName 	= table;
	}

	/**
	 * @method create
	 * @description Appel de la méthode create =>
	 * this.service.create({...});
	 * @param entity
	 */
	public async create(entity: Partial<T>): Promise<void | T> {
		const columns = Object.keys(entity);
		const values = Object.values(entity);

		const columnsString = columns.join(', ');
		const valuesPlaceholders = new Array(values.length).fill('?').join(', ');

		this.query = `INSERT INTO ${this.tableName} (${columnsString}) VALUES (${valuesPlaceholders})`;
		this.params = values;

		return await this.execute(this.query, this.params);
	}

	/**
	 * @method update
	 * @description Appel de la méthode update =>
	 * this.service.update({...});
	 * @param entity
	 * @param id
	 */
	public async update(entity: Partial<T>, id: number): Promise<void | T> {
		const setColumns = Object.keys(entity)
			.filter(column => entity[column as keyof T] !== undefined && entity[column as keyof T] !== null)
			.map(column => `${column} = ?`)
			.join(', ');

		const values = Object.values(entity).filter(value => value !== undefined && value !== null);
		values.push(id);

		this.query = `UPDATE ${this.tableName} SET ${setColumns} WHERE id = ?`;
		this.params = values;

		return await this.execute(this.query, this.params);
	}

	/**
	 * @method delete
	 * @description Appel de la méthode delete =>
	 * this.service.delete(id);
	 * @param id
	 */
	public async delete(id: string): Promise<void> {
		this.query = `DELETE FROM ${this.tableName} WHERE id = ?`;
		this.params = [id];

		return await this.execute(this.query, this.params);
	}

	/**
	 * @method select
	 * @description Pour faire un select sur la table liée au service =>
	 * Pour la table "users" : this.userService.select('id', 'name').run();
	 * Les champs passés en paramètres doivent correspondrent à ceux de la table du service
	 * @param fields
	 */
	public select(...fields: string[]) {
		if (fields.length === 0) {
			throw new Error('select() : Vous devez ajouter au moins une colonne');
		}

		const columns = fields.map(field => `${this.tableName}.${field}`).join(', ');

		if (this.queryJoin) {
			this.groupByColumns = [columns];
		}

		this.queryStart = `SELECT ${columns}`;
		return {
			where: (column: string, operator: WhereOperatorType, value: any) => this.where(column, operator, value),
			andWhere: (column: string, operator: WhereOperatorType, value: any) => this.andWhere(column, operator, value),
			orWhere: (column: string, operator: WhereOperatorType, value: any) => this.orWhere(column, operator, value),
			run: () => this.run(),

			/**
			 * @method selectJoin
			 * @description Pour faire un select sur une table jointe =>
			 * On passe la table jointe en premier paramètre, puis ses champs à sélectionner
			 * this.userService
			 * 		.select('id', autres colonnes de la table users)
			 * 		.selectJoin('customers', 'user_id').run();
			 * @param table
			 * @param fields
			 */
			selectJoin: (table: string, ...fields: string[]) => {
				const joinedColumns = fields.flatMap(column => [`'${String(column)}'`, `${table}.${String(column)}`]).join(', ');

				this.queryStart += `, JSON_ARRAYAGG(JSON_OBJECT(${joinedColumns})) AS ${table.slice(0, -1)}`;
				this.queryJoin = true;

				return {
					/**
					 * @method join
					 * @description Permet de faire une jointure =>
					 * this.userService
					 * 		.select('id', autres colonnes de la table users)
					 * 		.selectJoin('customers', 'users.id', 'customers.user_id').run();
					 * 		.join('LEFT JOIN', 'orders', 'users.id', 'orders.user_id').run();
					 * @param join
					 * @param table
					 * @param columnA
					 * @param columnB
					 */
					join: (join: 'LEFT JOIN' | 'INNER JOIN' | 'RIGHT JOIN', table: string, columnA: string, columnB: string) => {
						this.queryEnd += `${join} ${table} ON ${columnA} = ${columnB} `;

						return {
							where: (column: string, operator: WhereOperatorType, value: any) => this.where(column, operator, value),
							andWhere: (column: string, operator: WhereOperatorType, value: any) => this.andWhere(column, operator, value),
							orWhere: (column: string, operator: WhereOperatorType, value: any) => this.orWhere(column, operator, value),
							run: () => this.run()
						};
					}
				};
			}
		};
	}

	/**
	 * @method all
	 * @description Récupère toutes les données de la table
	 */
	public all() {
		this.queryStart = `SELECT *`;

		return {
			where: (column: string, operator: WhereOperatorType, value: any) => this.where(column, operator, value),
			andWhere: (column: string, operator: WhereOperatorType, value: any) => this.andWhere(column, operator, value),
			orWhere: (column: string, operator: WhereOperatorType, value: any) => this.orWhere(column, operator, value),
			run: () => this.run()
		};
	}
}

export default MysqlManager;