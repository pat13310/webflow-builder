/**
 * server.ts
 *
 * Point d'entrée principal de l'application.
 * Importe et orchestre le démarrage des différents serveurs (webhook, base de données, etc.).
 * Gère les erreurs critiques de démarrage et arrête l'application si nécessaire.
 */
import { startWebhookServer } from './startWebhookServer';
import { startDatabaseServer } from './startDatabaseServer'; // Assurez-vous que ce fichier existe et exporte une fonction startDatabaseServer similaire

/**
 * Fonction principale asynchrone auto-exécutée (IIFE) pour gérer le démarrage.
 */
(async () => {
  console.log('[Main] Démarrage de l\'application et de ses serveurs...');

  try {
    // --- Stratégie de démarrage ---
    // Choisissez l'une des options ci-dessous :

    // Option 1: Démarrage en parallèle (plus rapide si les serveurs sont indépendants)
    console.log('[Main] Démarrage des serveurs en parallèle...');
    await Promise.all([
      startDatabaseServer(), // Démarre la base de données
      startWebhookServer()   // Démarre le webhook en même temps
      // Ajoutez ici d'autres fonctions de démarrage si nécessaire : startAutreService()
    ]);
    console.log('[Main] Tous les serveurs (démarrés en parallèle) sont prêts.');

    // Option 2: Démarrage séquentiel (si un serveur dépend d'un autre)
    /*
    console.log('[Main] Démarrage des serveurs séquentiellement...');

    console.log('[Main] Démarrage du serveur de base de données...');
    await startDatabaseServer();
    console.log('[Main] Serveur de base de données prêt.');

    console.log('[Main] Démarrage du serveur webhook...');
    await startWebhookServer();
    console.log('[Main] Serveur webhook prêt.');

    // Ajoutez d'autres démarrages séquentiels ici si nécessaire

    console.log('[Main] Tous les serveurs (démarrés séquentiellement) sont prêts.');
    */
    // --- Fin des stratégies de démarrage ---

    console.log('[Main] Application initialisée avec succès !');

  } catch (error) {
    // Si une erreur est *relancée* par l'une des fonctions start...Server, elle sera capturée ici.
    console.error('[Main] ERREUR CRITIQUE lors du démarrage d\'un serveur. L\'application va s\'arrêter.', error);
    // Quitter le processus avec un code d'erreur pour indiquer l'échec du démarrage
    process.exit(1);
  }
})();

// Aucun autre code d'exécution ici, tout est dans l'IIFE async.