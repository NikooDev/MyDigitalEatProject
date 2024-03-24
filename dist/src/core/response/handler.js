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
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @class Handler
 * @description Gestion des erreurs et des réponses vers le client
 */
class Handler {
    /**
     * @description Réponse erreur
     * @param res
     * @param code
     * @param message
     * @param data
     */
    static exception(res, message, code, data) {
        return res.status(code).json({
            code,
            success: false,
            message: message
        });
    }
    /**
     * @description Réponse succès
     * @param res
     * @param message
     * @param code
     * @param datas
     */
    static success(res, message, code, datas) {
        return res.status(code).json(Object.assign({ success: true, message: message }, datas));
    }
    /**
     * @description Wrapper try/catch pour les fonctions asynchrones
     * Permet d'éviter de répéter le même catch
     * @param res
     * @param context
     * @param callback
     */
    static tryCatch(res, context, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield callback();
            }
            catch (err) {
                if (err instanceof Error) {
                    Handler.logger(`Erreur ${context.name + ' ' + err}`, 'error');
                }
                return Handler.exception(res, context.error, 500, null);
            }
        });
    }
    /**
     * @description Loggers personnalisés
     * @param message
     * @param type
     */
    static logger(message, type) {
        if (type === 'error') {
            return console.error('\x1b[1m\x1b[41m\x1b[37m', message, '\x1b[0m');
        }
        else {
            return console.info('\x1b[1m\x1b[47m\x1b[30m', message, '\x1b[0m');
        }
    }
}
exports.default = Handler;
//# sourceMappingURL=handler.js.map