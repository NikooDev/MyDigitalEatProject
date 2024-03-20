import 'reflect-metadata';
import 'module-alias/register';

import ReadyServer from '@Src/start/ReadyServer';

/*
|--------------------------------------------------------------------------
| Démarrage du serveur
|--------------------------------------------------------------------------
|
| Le contenu de ce fichier est destiné à démarrez le serveur HTTP
| et à accepter les connexions entrantes.
|
*/

new ReadyServer()
	.start()
	.catch(console.error);