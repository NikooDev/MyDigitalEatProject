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
const DaoService_1 = __importDefault(require("./DaoService"));
const Container_1 = __importDefault(require("../../core/service/Container"));
class CardService extends DaoService_1.default {
    constructor() {
        super('cards');
    }
    create(entity) {
        const _super = Object.create(null, {
            create: { get: () => super.create }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.create.call(this, entity);
            const lastInsertId = yield this.select(true, 'LAST_INSERT_ID() AS id').run();
            if (lastInsertId && lastInsertId.length > 0 && typeof lastInsertId[0].id !== 'undefined') {
                return lastInsertId[0].id;
            }
        });
    }
}
Container_1.default.register('CardService', new CardService());
exports.default = CardService;
//# sourceMappingURL=CardService.js.map