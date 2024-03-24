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
const promise_1 = __importDefault(require("mysql2/promise"));
const Db_1 = __importDefault(require("../../database/mysql/Db"));
/**
 * @class Builder
 * @extends MysqlDb
 * @description Constructeur de requêtes SQL
 */
class Builder extends Db_1.default {
    constructor() {
        super();
        /**
         * @property conditions
         * @description Conditions de la requête SQL
         */
        this.conditions = {
            where: '', andOr: '', order: '', limit: ''
        };
        /**
         * @property conditionsEnable
         * @description Conditions activées de la requête SQL
         */
        this.conditionsEnable = {
            where: false, and: false, or: false, order: false, limit: false, group: false
        };
    }
    /**
     * @method where
     * @description Ajout d'une condition WHERE
     * .where('column', '=', value)
     * @param column
     * @param operator
     * @param value
     */
    where(column, operator, value) {
        this.conditionsEnable.where = true;
        this.addWhereLogic(column, operator, value);
        return {
            andWhere: (column, operator, value) => this.andWhere(column, operator, value),
            orWhere: (column, operator, value) => this.orWhere(column, operator, value),
            orderBy: (column, direction) => this.orderBy(column, direction),
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
    andWhere(column, operator, value) {
        this.conditionsEnable.and = true;
        this.addWhereLogic(column, operator, value, 'AND');
        return {
            andWhere: (column, operator, value) => this.andWhere(column, operator, value),
            orWhere: (column, operator, value) => this.orWhere(column, operator, value),
            orderBy: (column, direction) => this.orderBy(column, direction),
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
    orWhere(column, operator, value) {
        this.conditionsEnable.or = true;
        this.addWhereLogic(column, operator, value, 'OR');
        return {
            andWhere: (column, operator, value) => this.andWhere(column, operator, value),
            orWhere: (column, operator, value) => this.orWhere(column, operator, value),
            orderBy: (column, direction) => this.orderBy(column, direction),
            run: () => this.run()
        };
    }
    /**
     * @method orderBy
     * @description Ajout d'un ORDER BY
     * @param column
     * @param direction
     */
    orderBy(column, direction) {
        this.conditions.order = `ORDER BY ${column} ${direction}`;
        this.conditionsEnable.order = true;
        return {
            limit: (limit) => this.limit(limit),
            run: () => this.run()
        };
    }
    /**
     * @method limit
     * @description Ajout d'un LIMIT
     * @param limit
     */
    limit(limit) {
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
    run() {
        const _super = Object.create(null, {
            execute: { get: () => super.execute }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queryJoin) {
                const query = `${this.queryStart} ${this.queryFrom} ${this.queryEnd}`;
                const queryWhere = this.conditionsEnable.where ? this.conditions.where : '';
                const queryAndOrWhere = (this.conditionsEnable.and || this.conditionsEnable.or) ? this.conditions.andOr : '';
                const queryGroupBy = this.conditionsEnable.group ? `GROUP BY ${this.groupByColumns.join(', ')}` : '';
                this.query = `${query} ${queryWhere} ${queryAndOrWhere} ${queryGroupBy}`;
            }
            else {
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
            return yield _super.execute.call(this, query, this.params);
        });
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
    addWhereLogic(column, operator, value, logic) {
        this.query += `${this.queryStart} ${this.queryFrom}`;
        if (this.conditionsEnable.where) {
            if (this.conditionsEnable.and || this.conditionsEnable.or) {
                this.conditions.where += ` ${logic} ${column} ${operator} ${this.escapeValue(value)}`;
            }
            else {
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
    escapeValue(value) {
        if (Array.isArray(value)) {
            const escapedValues = value.map(val => this.escapeValue(val));
            return `(${escapedValues.join(', ')})`;
        }
        else if (typeof value === 'string') {
            return promise_1.default.escape(value);
        }
        else {
            return String(value);
        }
    }
}
exports.default = Builder;
//# sourceMappingURL=Builder.js.map