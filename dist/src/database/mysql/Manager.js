"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Builder_1 = __importDefault(require("../../database/mysql/Builder"));
/**
 * @class MysqlManager
 * @extends Builder
 * @description Gestionnaire de requêtes MySQL
 * @abstract
 */
class MysqlManager extends Builder_1.default {
    constructor(table) {
        super();
        this.queryStart = 'SELECT ';
        this.queryFrom = 'FROM ' + table;
        this.queryEnd = '';
        this.tableName = table;
    }
    /**
     * @method create
     * @description Appel de la méthode create =>
     * this.service.create({...});
     * @param entity
     */
    create(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            const columns = Object.keys(entity);
            const values = Object.values(entity);
            const columnsString = columns.join(', ');
            const valuesPlaceholders = new Array(values.length).fill('?').join(', ');
            this.query = `INSERT INTO ${this.tableName} (${columnsString}) VALUES (${valuesPlaceholders})`;
            this.params = values;
            return yield this.execute(this.query, this.params);
        });
    }
    /**
     * @method update
     * @description Appel de la méthode update =>
     * this.service.update({...}, id);
     * @param entity
     * @param id
     */
    update(entity, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const setColumns = Object.keys(entity)
                .filter(column => entity[column] !== undefined && entity[column] !== null)
                .map(column => `${column} = ?`)
                .join(', ');
            const values = Object.values(entity).filter(value => value !== undefined && value !== null);
            values.push(id);
            this.query = `UPDATE ${this.tableName} SET ${setColumns} WHERE id = ?`;
            this.params = values;
            return yield this.execute(this.query, this.params);
        });
    }
    /**
     * @method delete
     * @description Appel de la méthode delete =>
     * this.service.delete(id);
     * @param id
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.query = `DELETE FROM ${this.tableName} WHERE id = ?`;
            this.params = [id];
            return yield this.execute(this.query, this.params);
        });
    }
    /**
     * @method select
     * @description Select sur la table liée au service =>
     * Pour la table "users" : this.userService.select('id', 'name').run();
     * Les champs passés en paramètres doivent correspondrent à ceux de la table du service
     * @param useFunction Si true, les champs passés en paramètres ne sont pas préfixés par le nom de la table
     * @param fields Noms des colonnes à sélectionner
     */
    select(useFunction, ...fields) {
        if (fields.length === 0) {
            throw new Error('select() : Vous devez ajouter au moins une colonne');
        }
        const columns = fields.map(field => useFunction ? `${field}` : `${this.tableName}.${field}`).join(', ');
        this.groupByColumns = [columns];
        this.queryStart = `SELECT ${columns}`;
        return {
            limit: (limit) => this.limit(limit),
            groupBy: (...fields) => this.groupBy(...fields),
            where: (column, operator, value) => this.where(column, operator, value),
            andWhere: (column, operator, value) => this.andWhere(column, operator, value),
            orWhere: (column, operator, value) => this.orWhere(column, operator, value),
            selectJoin: (table, aggregate, concat, ...fields) => this.selectJoin(table, aggregate, concat, ...fields),
            run: () => this.run()
        };
    }
    groupBy(...fields) {
        const columns = fields.map(field => `${field}`).join(', ');
        this.groupByColumns.push(columns);
        return {
            selectJoin: (table, aggregate, concat, ...fields) => this.selectJoin(table, aggregate, concat, ...fields),
        };
    }
    /**
     * @method selectJoin
     * @description Pour faire un select sur une table jointe =>
     * On passe la table jointe en premier paramètre, puis ses champs à sélectionner
     * this.userService
     * 		.select('id', autres colonnes de la table users)
     * 		.selectJoin('customers', true, false, 'user_id').run();
     * @param table
     * @param concat
     * @param aggregate
     * @param fields
     */
    selectJoin(table, aggregate, concat, ...fields) {
        const joinedColumns = fields.flatMap(column => [`'${String(column)}'`, `${table}.${String(column)}`]).join(', ');
        if (concat) {
            this.queryStart += `, CONCAT('[', GROUP_CONCAT( DISTINCT JSON_OBJECT(${joinedColumns})),']') AS ${table.slice(0, -1)}`;
        }
        else if (aggregate) {
            this.queryStart += `, JSON_ARRAYAGG(JSON_OBJECT(${joinedColumns})) AS ${table.slice(0, -1)}`;
        }
        else {
            this.queryStart += `, JSON_OBJECT(${joinedColumns}) AS ${table.slice(0, -1)}`;
        }
        this.conditionsEnable.group = true;
        this.queryJoin = true;
        return {
            /**
             * @method join
             * @description Permet de faire une jointure =>
             * this.userService
             * 		.select('id', true, false, autres colonnes de la table users)
             * 		.selectJoin('customers', 'users.id', 'customers.user_id')
             * 		.join('LEFT JOIN', 'orders', 'users.id', 'orders.user_id').run();
             * @param join
             * @param table
             * @param columnA
             * @param columnB
             */
            join: (join, table, columnA, columnB) => {
                this.queryEnd += `${join} ${table} ON ${columnA} = ${columnB} `;
                return {
                    selectJoin: (table, aggregate, concat, ...fields) => this.selectJoin(table, aggregate, concat, ...fields),
                    where: (column, operator, value) => this.where(column, operator, value),
                    andWhere: (column, operator, value) => this.andWhere(column, operator, value),
                    orWhere: (column, operator, value) => this.orWhere(column, operator, value),
                    run: () => this.run()
                };
            }
        };
    }
    /**
     * @method all
     * @description Récupère toutes les données de la table
     */
    all() {
        this.queryStart = `SELECT *`;
        return {
            limit: (limit) => this.limit(limit),
            orderBy: (column, order) => this.orderBy(column, order),
            where: (column, operator, value) => this.where(column, operator, value),
            andWhere: (column, operator, value) => this.andWhere(column, operator, value),
            orWhere: (column, operator, value) => this.orWhere(column, operator, value),
            run: () => this.run()
        };
    }
}
exports.default = MysqlManager;
//# sourceMappingURL=Manager.js.map