"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
require("module-alias/register");
const ReadyServer_1 = __importDefault(require("./src/start/ReadyServer"));
/*
|--------------------------------------------------------------------------
| Démarrage du serveur
|--------------------------------------------------------------------------
|
| Le contenu de ce fichier est destiné à démarrez le serveur HTTP
| et à accepter les connexions entrantes.
|
*/
new ReadyServer_1.default()
    .start()
    .catch(console.error);
//# sourceMappingURL=server.js.map