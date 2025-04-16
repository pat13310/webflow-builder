/**
 * startWebhookServer.ts
 *
 * Ce module exporte une fonction pour démarrer le serveur webhook.
 * Il ne démarre PAS le serveur lors de l'importation.
 */
import { webhookServer } from './webhookServer'; // Assurez-vous que ce chemin est correct et qu'il exporte 'webhookServer'

/**
 * Démarre le serveur webhook de manière asynchrone.
 * Gère les erreurs de démarrage spécifiques à ce serveur et les propage à l'appelant.
 * @returns {Promise<void>} Une promesse qui se résout lorsque le serveur a démarré, ou rejette en cas d'erreur.
 * @throws {Error} Relance l'erreur si le démarrage échoue.
 */
export async function startWebhookServer(): Promise<void> {
  console.log('[Webhook] Préparation du démarrage du serveur...'); // Message spécifique au serveur
  try {
    // Supposons que webhookServer.start() retourne une promesse
    await webhookServer.start();
    console.log('[Webhook] Serveur démarré avec succès.');
  } catch (error) {
    console.error('[Webhook] Erreur lors du démarrage du serveur :', error);
    // Il est crucial de relancer l'erreur pour que server.ts puisse la capturer
    throw error;
  }
}

// Remarque : Pas d'exécution de code ici (pas d'appel à startWebhookServer() ou webhookServer.start())