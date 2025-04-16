import useWorkflowStore from './workflowStore';

let ws: WebSocket | null = null;
const WS_URL = import.meta.env.VITE_WEBHOOK_WS_URL;
const SERVER_URL = import.meta.env.VITE_WEBHOOK_SERVER_URL;

// États WebSocket standard
const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

// Types
export interface WebhookData {
  nodeId: string;
  url?: string;
  path?: string;
  method?: string;
  body?: string;
  headers?: { [key: string]: string };
  queryParams?: { [key: string]: string };
  timeout?: number;
  isValidated?: boolean;
}

export type WebhookStatus = 'idle' | 'running' | 'success' | 'error' | 'warning' | 'validated';

// Configuration WebSocket
const RETRY_DELAY = 2000; // 2 secondes entre chaque tentative
const MAX_RETRIES = 3;

// Callbacks de validation
let onValidateCallbacks: { [nodeId: string]: (isValid: boolean) => void } = {};

// Fonction pour envoyer un message via WebSocket
export const sendWebSocketMessage = async (message: any) => {
  try {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      ws = await initWebSocket();
    }
    ws.send(JSON.stringify(message));
    console.log('Message WebSocket envoyé:', message);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message WebSocket:', error);
    throw error;
  }
};

// Fonction pour initialiser la connexion WebSocket
// Variable globale pour suivre les tentatives
let retries = 0;
let isConnecting = false;

export async function initWebSocket(): Promise<WebSocket> {
  // Si une connexion existe et est ouverte, la réutiliser
  if (ws?.readyState === WS_STATES.OPEN) {
    return ws;
  }

  // Si déjà en cours de connexion, attendre
  if (isConnecting) {
    console.log('Connexion déjà en cours, attente...');
    await new Promise(resolve => setTimeout(resolve, 500));
    return initWebSocket();
  }

  const tryConnect = async (): Promise<WebSocket> => {
    try {
      isConnecting = true;

      // Si la connexion existe mais n'est pas ouverte, la fermer
      if (ws) {
        ws.close();
        ws = null;
      }

      return new Promise((resolve, reject) => {
        console.log('Tentative de connexion à', WS_URL);
        try {
          const socket = new WebSocket(WS_URL);
          let timeoutId: NodeJS.Timeout;

          // Timeout de connexion de 5 secondes
          timeoutId = setTimeout(() => {
            socket.close();
            reject(new Error('Timeout de connexion WebSocket'));
          }, 5000);

          socket.onopen = () => {
            clearTimeout(timeoutId);
            console.log('WebSocket connecté avec succès');
            retries = 0; // Réinitialiser le compteur en cas de succès
            isConnecting = false;
            resolve(socket);
          };

          socket.onerror = (error) => {
            clearTimeout(timeoutId);
            console.error('Erreur WebSocket:', error);
            console.error('Détails:', {
              readyState: socket.readyState,
              url: WS_URL,
              error: error
            });
            reject(error);
          };

          socket.onclose = () => {
            clearTimeout(timeoutId);
            console.log('Connexion WebSocket fermée');
            if (isConnecting) {
              reject(new Error('Connexion WebSocket fermée'));
            }
          };

          socket.onclose = (event) => {
            clearTimeout(timeoutId);
            console.log('Connexion WebSocket fermée:', event.reason || 'Raison inconnue');
            ws = null; // Réinitialiser la référence
            if (isConnecting) {
              reject(new Error('Connexion WebSocket fermée'));
            }
          };

          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              console.log('Message WebSocket reçu:', data);
              
              if (data.type === 'webhook_error') {
                console.error('Erreur du serveur webhook:', data.error);
                if (!isConnecting) {
                  // Si nous ne sommes pas en train de nous connecter, propager l'erreur
                  throw new Error(data.error);
                } else {
                  reject(new Error(data.error));
                }
                return;
              }

              if (data.type === 'webhook_validated' && data.nodeId) {
                const callback = onValidateCallbacks[data.nodeId];
                if (callback) {
                  callback(true);
                }
              }
              if (data.type === 'webhook_execution' && data.nodeId) {
                try {
                  // Mettre à jour le statut du nœud via workflowStore
                  const store = useWorkflowStore.getState();
                  if (!store) {
                    console.error('workflowStore non initialisé');
                    return;
                  }
                  
                  // Retirer le préfixe webhook- pour la mise à jour du statut
                  const cleanNodeId = data.nodeId.replace(/^webhook-/, '');
                  console.log('Mise à jour du statut pour le nœud:', cleanNodeId);
                  
                  setTimeout(() => {
                    const currentStore = useWorkflowStore.getState();
                    if (currentStore) {
                      currentStore.updateNodeStatus(cleanNodeId, 'running');
                      console.log(`Statut remis à success   ${cleanNodeId}`);
                    }
                  }, 1000); // Augmenté à 2 secondes pour mieux voir l'effet

                  // Signal de succès temporaire
                  store.updateNodeStatus(cleanNodeId, 'success');
                  console.log('Statut mis à jour en validated');         

               
                  // Appeler aussi le callback si présent
                  const callback = onValidateCallbacks[data.nodeId];
                  if (callback) {
                    callback(true);
                  }
                } catch (error) {
                  console.error('Erreur lors de la mise à jour du statut:', error);
                }
              }
            } catch (error) {
              console.error('Erreur lors du traitement du message:', error);
              reject(error);
            }
          };

          socket.onclose = () => {
            console.log('WebSocket déconnecté');
            isConnecting = false;
            if (retries < MAX_RETRIES) {
              retries++;
              console.log(`Tentative de reconnexion ${retries}/${MAX_RETRIES} dans ${RETRY_DELAY}ms...`);
              setTimeout(() => initWebSocket(), RETRY_DELAY);
            } else {
              console.error('Nombre maximum de tentatives de reconnexion atteint');
              // Réinitialiser le compteur après un certain délai
              setTimeout(() => {
                retries = 0;
                console.log('Réinitialisation du compteur de tentatives');
              }, RETRY_DELAY * 2);
            }
          };
        } catch (error) {
          console.error('Erreur lors de la création du WebSocket:', error);
          reject(error);
        }
      });
    } catch (error) {
      isConnecting = false;
      throw error;
    }
  };

  // Boucle de tentatives
  while (retries < MAX_RETRIES) {
    try {
      const connection = await tryConnect();
      ws = connection; // Assigner la connexion réussie
      console.log('Connexion WebSocket établie avec succès');
      return connection;
    } catch (error) {
      console.error(`Tentative ${retries + 1}/${MAX_RETRIES} échouée:`, error);
      retries++;
      
      // Si nous avons atteint le nombre maximum de tentatives
      if (retries >= MAX_RETRIES) {
        console.error('Nombre maximum de tentatives atteint');
        throw new Error('Impossible d\'initialiser la connexion WebSocket après plusieurs tentatives');
      }

      // Attendre avant la prochaine tentative
      console.log(`Nouvelle tentative dans ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }

  // Si on sort de la boucle sans connexion
  throw new Error('Impossible d\'initialiser la connexion WebSocket');
}

export async function registerWebhook(webhookData: WebhookData): Promise<void> {
  try {
    // Vérification complète des données requises
    if (!webhookData?.nodeId || !webhookData?.path) {
      console.error('Données webhook invalides:', webhookData);
      throw new Error('nodeId et path sont requis pour l\'enregistrement du webhook');
    }

    // Normalisation des données
    const normalizedData: WebhookData = {
      nodeId: webhookData.nodeId,
      path: webhookData.path,
      method: webhookData.method || 'GET',
      body: webhookData.body || '{}',
      headers: webhookData.headers || { 'Content-Type': 'application/json' },
      queryParams: webhookData.queryParams || {},
      isValidated: false
    };

    console.log('Début d\'enregistrement du webhook avec nodeId:', webhookData.nodeId);
    const socket = await initWebSocket();
    
    console.log('Données du webhook normalisées:', normalizedData);

    const message = {
      type: 'register',
      webhook: normalizedData
    };

    console.log('Envoi du message d\'enregistrement:', message);

    socket.send(JSON.stringify(message));

    // Enregistrer le callback de validation
    onValidateCallbacks[webhookData.nodeId] = (isValid: boolean) => {
      if (isValid) {
        console.log(`Webhook ${webhookData.nodeId} validé`);
      }
    };

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du webhook:', error);
    throw error;
  }
}

// Fonction pour exécuter un webhook
export async function executeWebhook(webhookData: WebhookData): Promise<{ result: any; url: string }> {
  try {
    if (!webhookData?.nodeId) {
      console.error('Données webhook invalides:', webhookData);
      throw new Error('nodeId est requis pour l\'exécution du webhook');
    }

    // Construire l'URL du webhook
    const baseUrl = SERVER_URL;
    const path = webhookData.path || webhookData.nodeId;
    const url = `${baseUrl}/webhook/webflow/${path}`;

    console.log('Démarrage de l\'exécution du webhook...', webhookData.nodeId);
    
    // Initialiser la connexion WebSocket si nécessaire
    ws = await initWebSocket();
    console.log('WebSocket prêt pour l\'envoi');

    console.log('URL du webhook:', url);
    
    return new Promise((resolve, reject) => {
      // Vérifier l'état du WebSocket
      if (!ws || ws.readyState !== WS_STATES.OPEN) {
        reject(new Error('La connexion WebSocket n\'est pas établie'));
        return;
      }

      // Debug: Afficher l'état actuel
      console.log('WebSocket readyState:', ws.readyState);
      console.log('NodeId attendu:', webhookData.nodeId);

      // // Timeout plus long pour le développement
      // const timeoutDuration = 120000; // 2 minutes
      // console.log('Délai de timeout configuré:', timeoutDuration, 'ms');

      // // Timeout pour la réponse du webhook
      // const timeoutId = setTimeout(() => {
      //   ws?.removeEventListener('message', messageHandler);
      //   console.error('Timeout déclenché après', timeoutDuration, 'ms');
      //   console.error('Dernier état WebSocket:', ws?.readyState);
      //   reject(new Error('Le serveur ne répond pas (timeout)'));
      // }, timeoutDuration);

      // Gestionnaire de messages
      const messageHandler = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', data);
          console.log('Comparaison nodeId:', {
            attendu: webhookData.nodeId,
            recu: data.nodeId,
            match: data.nodeId === webhookData.nodeId
          });

          if (data.type === 'webhook_execution') {
            if (data.nodeId === webhookData.nodeId) {
              console.log('Message WebSocket correspond au nodeId attendu');
              // clearTimeout(timeoutId);
              ws?.removeEventListener('message', messageHandler);
              resolve({ result: data.data, url });
            } else {
              console.log('Message WebSocket reçu pour un autre nodeId');
            }
          } else {
            console.log('Message WebSocket de type différent:', data.type);
          }
        } catch (error) {
          console.error('Erreur lors du traitement de la réponse:', error);
        }
      };

      // Ajouter l'écouteur de messages
      ws.addEventListener('message', messageHandler);

      try {
        // Envoyer la requête d'exécution
        ws.send(JSON.stringify({
          type: 'execute',
          webhook: {
            nodeId: webhookData.nodeId,
            path: webhookData.path || Math.random().toString(36).substring(2, 11),
            method: webhookData.method || 'POST',
            headers: webhookData.headers || {},
            body: webhookData.body || '{}'
          }
        }));
      } catch (error) {
        // clearTimeout(timeoutId);
        ws.removeEventListener('message', messageHandler);
        reject(new Error('Erreur lors de l\'envoi de la requête webhook'));
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'exécution du webhook:', error);
    throw error;
  }
}

// Fonction pour valider un webhook
export async function validateWebhook(webhookData: WebhookData): Promise<boolean> {
  try {
    if (!webhookData.url) {
      throw new Error('URL invalide');
    }
    const response = await fetch(webhookData.url, {
      method: webhookData.method,
      headers: webhookData.headers,
      body: webhookData.method !== 'GET' ? webhookData.body : undefined
    });
    return response.ok;
  } catch (error) {
    console.error('Erreur lors de la validation du webhook:', error);
    return false;
  }
}
