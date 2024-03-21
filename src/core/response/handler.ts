import { Response } from 'express';

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
	public static exception(res: Response, message: string, code: number, data?: {}) {
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
	public static success(res: Response, message?: string, code?: number, datas?: {}) {
		return res.status(code).json({
			success: true,
			message: message,
			...datas,
		});
	}

	/**
	 * @description Wrapper try/catch pour les fonctions asynchrones
	 * Permet d'éviter de répéter le même catch
	 * @param res
	 * @param context
	 * @param callback
	 */
	public static async tryCatch(res: Response, context: { name: string, error: string }, callback: () => Promise<Response | void>) {
		try {
			await callback();
		} catch (err) {
			if (err instanceof Error) {
				Handler.logger(`Erreur ${context.name+' '+err}`, 'error');
			}

			return Handler.exception(res, context.error, 500, null);
		}
	}

	/**
	 * @description Loggers personnalisés
	 * @param message
	 * @param type
	 */
	public static logger(message: string, type: 'error' | 'info') {
		if (type === 'error') {
			return console.error('\x1b[1m\x1b[41m\x1b[37m', message, '\x1b[0m');
		} else {
			return console.info('\x1b[1m\x1b[47m\x1b[30m', message, '\x1b[0m');
		}
	}
}

export default Handler;