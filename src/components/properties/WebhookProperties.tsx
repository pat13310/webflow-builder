import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Copy, Check, CheckCircle } from 'lucide-react';
import { registerWebhook } from '../../store/webhookStore';

interface WebhookPropertiesProps {
  nodeId: string;
  data: {
    path?: string;
    method?: string;
    body?: string;
    headers?: { [key: string]: string };
    queryParams?: { [key: string]: string };
    isValidated?: boolean;
  };
  onNodeUpdate: (field: string, value: any) => void;
  onWebhookValidate?: (nodeId: string) => void;
}

const WebhookProperties: React.FC<WebhookPropertiesProps> = ({
  nodeId,
  data,
  onNodeUpdate,
  onWebhookValidate,
}) => {
  const [copied, setCopied] = useState(false);
  const pathRef = useRef(data.path || Math.random().toString(36).substring(2, 10));
  const initializedRef = useRef(false);

  // Mémorise les données webhook actuelles
  const webhookData = useMemo(() => ({
    nodeId: `webhook-${nodeId}`,
    path: data.path || pathRef.current,
    method: data.method || 'GET',
    body: data.body || '{}',
    headers: data.headers || { 'Content-Type': 'application/json' },
    queryParams: data.queryParams || {},
    isValidated: data.isValidated || false,
  }), [data, nodeId]);

  // Initialiser le path une seule fois
  useEffect(() => {
    if (!data.path && !initializedRef.current) {
      initializedRef.current = true;
      onNodeUpdate('path', pathRef.current);
    }
  }, [data.path, onNodeUpdate]);

  const handleRegisterWebhook = async () => {
    try {
      if (!nodeId || typeof nodeId !== 'string') {
        console.error('nodeId invalide:', nodeId);
        return;
      }

      // Vérifier que toutes les données requises sont présentes
      const webhookDataToSend = {
        nodeId: webhookData.nodeId, // Déjà préfixé avec webhook-
        path: webhookData.path,
        method: webhookData.method,
        body: webhookData.body,
        headers: webhookData.headers,
        queryParams: webhookData.queryParams,
        isValidated: webhookData.isValidated
      };

      console.log('Enregistrement du webhook avec les données:', webhookDataToSend);

      console.log('Enregistrement du webhook avec nodeId:', nodeId);
      try {
        await registerWebhook(webhookDataToSend);
        console.log('Webhook enregistré avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du webhook:', error);
        // Gérer l'erreur ici (par exemple, afficher un message à l'utilisateur)
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du webhook:', error);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const register = async () => {
      try {
        if (isMounted) {
          await handleRegisterWebhook();
        }
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du webhook:', error);
      }
    };

    register();

    return () => {
      isMounted = false;
    };
  }, [nodeId, webhookData]);

  const handleCopyUrl = useCallback(() => {
    const url = `${import.meta.env.VITE_WEBHOOK_SERVER_URL}/webhook/webflow/${webhookData.path}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [webhookData.path]);

  const handleMethodChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onNodeUpdate('method', e.target.value);
    onNodeUpdate('isValidated', false);
  }, [onNodeUpdate]);

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={`${import.meta.env.VITE_WEBHOOK_SERVER_URL}/webhook/webflow/${webhookData.path}`}
          readOnly
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleCopyUrl}
          className="p-2 border rounded hover:bg-gray-100"
          title="Copier l'URL"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <select
          value={webhookData.method}
          onChange={handleMethodChange}
          className="p-2 border rounded"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      {/* Query Params */}
      {webhookData.method === 'GET' && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Paramètres de requête
          </label>
          <div className="space-y-2">
            {Object.entries(webhookData.queryParams).map(([key, value], index) => (
              <div key={`param-${index}`} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newParams = { ...webhookData.queryParams };
                    delete newParams[key];
                    newParams[e.target.value] = value;
                    onNodeUpdate('queryParams', newParams);
                  }}
                  className="flex-1 text-sm rounded border bg-gray-100"
                  placeholder="Nom"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    const newParams = { ...webhookData.queryParams };
                    newParams[key] = e.target.value;
                    onNodeUpdate('queryParams', newParams);
                  }}
                  className="flex-1 text-sm rounded border bg-gray-100"
                  placeholder="Valeur"
                />
                <button
                  onClick={() => {
                    const newParams = { ...webhookData.queryParams };
                    delete newParams[key];
                    onNodeUpdate('queryParams', newParams);
                  }}
                  className="text-red-500"
                >
                  x
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newParams = { ...webhookData.queryParams, '': '' };
                onNodeUpdate('queryParams', newParams);
              }}
              className="text-blue-600 text-sm"
            >
              + Ajouter un paramètre
            </button>
          </div>
        </div>
      )}

      {/* Body JSON */}
      {['POST', 'PUT', 'PATCH'].includes(webhookData.method) && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Corps de la requête (JSON)
          </label>
          <textarea
            value={webhookData.body}
            onChange={(e) => onNodeUpdate('body', e.target.value)}
            className="w-full h-32 text-sm font-mono rounded border bg-gray-100 p-2"
          />
        </div>
      )}

      {/* Headers */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          En-têtes HTTP
        </label>
        <div className="space-y-2">
          {Object.entries(webhookData.headers).map(([key, value], index) => (
            <div key={`header-${index}`} className="flex items-center space-x-2">
              <input
                type="text"
                value={key}
                onChange={(e) => {
                  const newHeaders = { ...webhookData.headers };
                  delete newHeaders[key];
                  newHeaders[e.target.value] = value;
                  onNodeUpdate('headers', newHeaders);
                }}
                className="flex-1 text-sm rounded border bg-gray-100"
                placeholder="Nom"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newHeaders = { ...webhookData.headers };
                  newHeaders[key] = e.target.value;
                  onNodeUpdate('headers', newHeaders);
                }}
                className="flex-1 text-sm rounded border bg-gray-100"
                placeholder="Valeur"
              />
              <button
                onClick={() => {
                  const newHeaders = { ...webhookData.headers };
                  delete newHeaders[key];
                  onNodeUpdate('headers', newHeaders);
                }}
                className="text-red-500"
              >
                x
              </button>
            </div>
          ))}
          <button
            onClick={() => {
              const newHeaders = { ...webhookData.headers, '': '' };
              onNodeUpdate('headers', newHeaders);
            }}
            className="text-blue-600 text-sm"
          >
            + Ajouter un en-tête
          </button>
        </div>
      </div>

      {/* Validation */}
      {!webhookData.isValidated ? (
        <button
          onClick={() => onWebhookValidate?.(nodeId)}
          className="mt-4 w-full px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
        >
          <CheckCircle className="inline-block w-4 h-4 mr-2" />
          Valider et arrêter l'écoute du webhook
        </button>
      ) : (
        <div className="mt-4 w-full px-4 py-2 text-sm text-green-600 bg-green-50 rounded flex items-center justify-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Webhook validé - Écoute terminée
        </div>
      )}
    </div>
  );
};

export default WebhookProperties;
