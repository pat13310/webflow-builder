/**
 * startDatabaseServer.ts
 *
 * Exporte la fonction pour démarrer l'instance unique du DatabaseServer.
 * Gère le démarrage asynchrone et la propagation des erreurs vers l'appelant.
 */
import { databaseServer } from './databaseServer'; // Importe l'instance unique

/**
 * Démarre l'instance du serveur de base de données de manière asynchrone.
 * @returns {Promise<void>} Une promesse qui se résout lorsque le serveur a démarré, ou rejette en cas d'erreur.
 * @throws {Error} Relance l'erreur si le démarrage échoue (ex: port déjà utilisé).
 */
export async function startDatabaseServer(): Promise<void> {
  console.log('[Database] Préparation du démarrage du serveur API...');
  try {
    // Appelle la méthode start() de l'instance importée, qui retourne une Promise
    await databaseServer.start();
    // Ce message ne s'affichera qu'après la résolution de la promesse de start()
    console.log('[Database] Serveur API démarré et prêt.');
  } catch (error) {
    // Capturer l'erreur rejetée par databaseServer.start()
    console.error('[Database] Erreur critique lors du démarrage du serveur API :', error);
    // Relancer l'erreur pour que server.ts puisse la gérer (et potentiellement arrêter l'app)
    throw error;
  }
}