import useWorkflowStore from './workflowStore';

let ws: WebSocket | null = null;
const WS_URL = import.meta.env.VITE_WEBHOOK_WS_URL;
const SERVER_URL = import.meta.env.VITE_WEBHOOK_SERVER_URL;

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

export type WebhookStatus = 'idle' | 'running' | 'success' | 'error';

// Configuration WebSocket
const RETRY_DELAY = 2000; // 2 secondes entre chaque tentative
const MAX_RETRIES = 3;

let isConnecting = false;
let retries = 0;
const onValidateCallbacks: { [key: string]: (success: boolean) => void } = {};

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

const WS_STATES = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
};

// Fonction pour initialiser la connexion WebSocket
export async function initWebSocket(): Promise<WebSocket> {
  // Si une connexion est déjà en cours, retourner une promesse en attente
  if (isConnecting) {
    return new Promise((resolve, reject) => {
      const checkConnection = setInterval(() => {
        if (ws && ws.readyState === WS_STATES.OPEN) {
          clearInterval(checkConnection);
          resolve(ws);
        } else if (retries >= MAX_RETRIES) {
          clearInterval(checkConnection);
          reject(new Error('Échec de la connexion WebSocket après plusieurs tentatives'));
        }
      }, 100);
    });
  }

  // Si nous avons déjà une connexion ouverte, la retourner
  if (ws && ws.readyState === WS_STATES.OPEN) {
    return ws;
  }

  // Fonction pour tenter une connexion
  const tryConnect = () => {
    return new Promise<WebSocket>((resolve, reject) => {
      try {
        console.log('Tentative de connexion WebSocket...');
        const socket = new WebSocket(WS_URL);

        socket.onopen = () => {
          console.log('Connexion WebSocket établie');
          ws = socket;
          isConnecting = false;
          retries = 0;
          resolve(socket);
        };

        socket.onerror = (error) => {
          console.error('Erreur WebSocket:', error);
          if (isConnecting) {
            reject(error);
          }
        };

        socket.onclose = () => {
          console.log('Connexion WebSocket fermée');
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
                  delete onValidateCallbacks[data.nodeId]; // Nettoyage
                }
              } catch (error) {
                console.error('Erreur lors de la mise à jour du statut:', error);
              }
            }
          } catch (error) {
            console.error('Erreur lors du traitement du message:', error);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  };

  // Logique principale de connexion avec retries
  isConnecting = true;
  while (retries < MAX_RETRIES) {
    try {
      const socket = await tryConnect();
      return socket;
    } catch (error) {
      console.error(`Tentative ${retries + 1}/${MAX_RETRIES} échouée:`, error);
      retries++;
      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }

  isConnecting = false;
  throw new Error('Impossible d\'établir une connexion WebSocket après plusieurs tentatives');
}

// Fonction pour enregistrer un webhook
export async function registerWebhook(webhookData: WebhookData): Promise<void> {
  try {
    // Initialiser la connexion WebSocket si nécessaire
    ws = await initWebSocket();

    // Envoyer la demande d'enregistrement
    const message = {
      type: 'register',
      webhook: webhookData
    };

    ws.send(JSON.stringify(message));
    console.log('Demande d\'enregistrement envoyée:', webhookData);

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
      console.log('Envoi de la requête webhook:', {
        url,
        method: webhookData.method,
        headers: webhookData.headers,
        body: webhookData.body
      });

      // Envoyer une requête au webhook
      const response = await fetch(url, {
        method: webhookData.method || 'GET',
        headers: webhookData.headers || {},
        body: webhookData.method !== 'GET' ? webhookData.body : undefined
      });

      // Définir un timeout pour la réponse WebSocket
      const timeoutId = setTimeout(() => {
        ws.removeEventListener('message', messageHandler);
        reject(new Error('Timeout lors de l\'attente de la réponse WebSocket'));
      }, webhookData.timeout || 60000);

      // Gérer la réponse WebSocket
      const messageHandler = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'webhook_execution' && data.nodeId === webhookData.nodeId) {
          clearTimeout(timeoutId);
          ws.removeEventListener('message', messageHandler);
          resolve({ result: data.data, url });
        }
      };

      // Écouter les messages WebSocket
      ws.addEventListener('message', messageHandler);

      // Gérer les erreurs de la requête
      if (!response.ok) {
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
