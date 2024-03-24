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
const Mysql_1 = __importDefault(require("../../config/Mysql"));
const handler_1 = __importDefault(require("../../core/response/handler"));
/**
 * @class MysqlDb
 * @description Cette classe encapsule la logique pour exécuter des requêtes SQL
 * sur une base de données MySQL à l'aide d'un pool de connexions
 */
class MysqlDb {
    constructor() {
        this.pool = promise_1.default.createPool(Mysql_1.default);
    }
    execute(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            if (!sql) {
                handler_1.default.logger('Aucune requête SQL fournie', 'error');
                return;
            }
            try {
                const row = yield connection.execute(sql, params);
                return row[0];
            }
            catch (error) {
                connection.destroy();
                throw error;
            }
            finally {
                connection.release();
            }
        });
    }
}
exports.default = MysqlDb;
//# sourceMappingURL=Db.js.map