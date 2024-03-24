"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Manager_1 = __importDefault(require("../../database/mysql/Manager"));
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
class DaoService extends Manager_1.default {
    constructor(table) {
        super(table);
    }
}
exports.default = DaoService;
//# sourceMappingURL=DaoService.js.map