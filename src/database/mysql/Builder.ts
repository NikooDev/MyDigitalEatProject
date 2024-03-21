import mysql from 'mysql2/promise';
import { WhereOperatorType } from '@Src/interfaces/Manager';
import MysqlDb from '@Src/database/mysql/Db';

/**
 * @class Builder
 * @extends MysqlDb
 * @description Constructeur de requêtes SQL
 */
abstract class Builder<T> extends MysqlDb {
	/**
	 * @property query
	 * @description Requête SQL pour CREATE, UPDATE, DELETE
	 */
	protected query: string;

	/**
	 * @property queryStart
	 * @description Partie de la requête SQL pour le SELECT
	 */
	protected queryStart: string;

	/**
	 * @property queryFrom
	 * @description Partie de la requête SQL pour le FROM
	 */
	protected queryFrom: string;

	/**
	 * @property queryEnd
	 * @description Partie de la requête SQL pour la partie après le FROM
	 */
	protected queryEnd: string;

	/**
	 * @property queryJoin
	 * @description Indique si la requête est une jointure
	 */
	protected queryJoin: boolean;

	/**
	 * @property groupByColumns
	 * @description Colonne(s) primaire(s) de la table
	 */
	protected groupByColumns: string[];

	/**
	 * @property params
	 * @description Paramètres de la requête SQL
	 */
	protected params: any[];

	/**
	 * @property conditions
	 * @description Conditions de la requête SQL
	 */
	protected conditions: { where: string, andOr: string, order: string, limit: string } = {
		where: '', andOr: '', order: '', limit: ''
	};

	/**
	 * @property conditionsEnable
	 * @description Conditions activées de la requête SQL
	 */
	protected conditionsEnable: { where: boolean, and: boolean, or: boolean, order: boolean, limit: boolean, group: boolean } = {
		where: false, and: false, or: false, order: false, limit: false, group: false
	};

	protected constructor() {
		super();
	}

	/**
	 * @method where
	 * @description Ajout d'une condition WHERE
	 * .where('column', '=', value)
	 * @param column
	 * @param operator
	 * @param value
	 */
	protected where(column: string, operator: WhereOperatorType, value: any) {
		this.conditionsEnable.where = true;
		this.addWhereLogic(column as string, operator, value);

		return {
			andWhere: (column: string, operator: WhereOperatorType, value: any) => this.andWhere(column, operator, value),
			orWhere: (column: string, operator: WhereOperatorType, value: any) => this.orWhere(column, operator, value),
			orderBy: (column: string, direction: 'DESC' | 'ASC') => this.orderBy(column, direction),
			run: () => this.run()
		};
	}

	/**
	 * @method andWhere
	 * @description Ajout d'une condition WHERE AND
	 * @param column
	 * @param operator
	 * @param value
	 */
	protected andWhere(column: string, operator: WhereOperatorType, value: any) {
		this.conditionsEnable.and = true;
		this.addWhereLogic(column as string, operator, value, 'AND');

		return {
			andWhere: (column: string, operator: WhereOperatorType, value: any) => this.andWhere(column, operator, value),
			orWhere: (column: string, operator: WhereOperatorType, value: any) => this.orWhere(column, operator, value),
			orderBy: (column: string, direction: 'DESC' | 'ASC') => this.orderBy(column, direction),
			run: () => this.run()
		};
	}

	/**
	 * @method orWhere
	 * @description Ajout d'une condition WHERE OR
	 * @param column
	 * @param operator
	 * @param value
	 */
	protected orWhere(column: string, operator: WhereOperatorType, value: any) {
		this.conditionsEnable.or = true;
		this.addWhereLogic(column as string, operator, value, 'OR');

		return {
			andWhere: (column: string, operator: WhereOperatorType, value: any) => this.andWhere(column, operator, value),
			orWhere: (column: string, operator: WhereOperatorType, value: any) => this.orWhere(column, operator, value),
			orderBy: (column: string, direction: 'DESC' | 'ASC') => this.orderBy(column, direction),
			run: () => this.run()
		};
	}

	/**
	 * @method orderBy
	 * @description Ajout d'un ORDER BY
	 * @param column
	 * @param direction
	 */
	protected orderBy(column: string, direction: 'ASC' | 'DESC') {
		this.conditions.order = `ORDER BY ${column} ${direction}`;
		this.conditionsEnable.order = true;

		return {
			limit: (limit: number) => this.limit(limit),
			run: () => this.run()
		};
	}

	/**
	 * @method limit
	 * @description Ajout d'un LIMIT
	 * @param limit
	 */
	protected limit(limit: number) {
		this.conditions.limit = `LIMIT ${limit}`;
		this.conditionsEnable.limit = true;

		return {
			run: () => this.run()
		};
	}

	/**
	 * @method run
	 * @description Formatage et exécution de la requête SQL
	 */
	protected async run(): Promise<T[] & T> {
		if (this.queryJoin) {
			const query = `${this.queryStart} ${this.queryFrom} ${this.queryEnd}`;
			const queryWhere = this.conditionsEnable.where ? this.conditions.where : '';
			const queryAndOrWhere = (this.conditionsEnable.and || this.conditionsEnable.or) ? this.conditions.andOr : '';
			const queryGroupBy = this.conditionsEnable.group ? `GROUP BY ${this.groupByColumns.join(', ')}` : '';

			this.query = `${query} ${queryWhere} ${queryAndOrWhere} ${queryGroupBy}`;
		} else {
			const query = `${this.queryStart} ${this.queryFrom}`;
			const queryWhere = this.conditionsEnable.where ? this.conditions.where : '';
			const queryAndOrWhere = (this.conditionsEnable.and || this.conditionsEnable.or) ? this.conditions.andOr : '';
			const queryOrderBy = this.conditionsEnable.order ? this.conditions.order : '';
			const queryLimit = this.conditionsEnable.limit ? this.conditions.limit : '';

			this.query = `${query} ${queryWhere} ${queryAndOrWhere} ${queryOrderBy} ${queryLimit}`;
		}

		const query = this.query.replace(/\s{2,}/g, ' ');

		this.query = '';
		this.queryStart = 'SELECT ';
		this.queryEnd = '';
		this.conditions = { where: '', limit: '', order: '', andOr: '' };
		this.conditionsEnable = { where: false, limit: false, order: false, and: false, or: false, group: false };

		return await super.execute(query, this.params);
	}

	/**
	 * @method addWhereLogic
	 * @description Formate la condition WHERE
	 * @param column
	 * @param operator
	 * @param value
	 * @param logic
	 * @private
	 */
	private addWhereLogic(column: string, operator: WhereOperatorType, value: string | number, logic?: 'AND' | 'OR'): void {
		this.query += `${this.queryStart} ${this.queryFrom}`;

		if (this.conditionsEnable.where) {
			if (this.conditionsEnable.and || this.conditionsEnable.or) {
				this.conditions.where += ` ${logic} ${column} ${operator} ${this.escapeValue(value)}`;
			} else {
				this.conditions.where = `WHERE ${column} ${operator} ${this.escapeValue(value)}`;
			}
		}
	}

	/**
	 * @method escapeValue
	 * @description Échappe les valeurs
	 * @param value
	 * @private
	 */
	private escapeValue(value: string | number | (string | number)[]): string {
		if (Array.isArray(value)) {
			const escapedValues = value.map(val => this.escapeValue(val));
			return `(${escapedValues.join(', ')})`;
		} else if (typeof value === 'string') {
			return mysql.escape(value);
		} else {
			return String(value);
		}
	}
}

export default Builder;