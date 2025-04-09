import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning';

// Interface pour l'état
interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  executingNodes: Set<string>; // IDs des nœuds en cours d'exécution active
  nodeStatuses: Map<string, { status: NodeStatus, timestamp: number }>; // Statut visuel par ID
  scheduleIntervals: Map<string, NodeJS.Timeout>; // Intervalles actifs par ID de nœud schedule
  nodeExecutionCounters: Map<string, number>; // Compteur d'exécutions par TYPE de nœud
  isExecuting: boolean; // Le workflow est-il globalement en cours d'exécution ?

  // Fonctions de base pour manipuler le graphe
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  // Fonctions d'exécution
  executeNode: (nodeId: string, context?: { isScheduled?: boolean }) => Promise<void>;
  executeWorkflow: (startNodeIds: string[]) => Promise<void>;
  stopExecution: () => void;

  // Mise à jour des nœuds
  updateNodeName: (nodeId: string, newName: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;

  // Fonctions internes (appelées par d'autres actions du store)
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;
  incrementNodeExecutionCounter: (nodeType: string) => void; // Fonction renommée
  updateCounterNode: (nodeId: string, increment: boolean) => void; // Fonction renommée

  // Persistance
  saveWorkflow: () => Promise<void>;
  loadWorkflow: () => void;
  exportWorkflow: () => Promise<{ nodes: Node[]; edges: Edge[]; metadata: any }>;
  importWorkflow: (workflow: { nodes: Node[]; edges: Edge[]; metadata?: any }) => Promise<void>;
}

// Helper pour valider un nœud
const isValidNode = (node: any): node is Node => {
  return (
    node &&
    typeof node.id === 'string' &&
    typeof node.type === 'string' && // Assure que 'type' existe et est une string
    node.type.length > 0 &&         // Assure que 'type' n'est pas une chaîne vide
    typeof node.position === 'object' &&
    typeof node.data === 'object'
  );
};

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // --- État Initial ---
  nodes: [],
  edges: [],
  executingNodes: new Set<string>(),
  nodeStatuses: new Map(),
  scheduleIntervals: new Map(),
  nodeExecutionCounters: new Map<string, number>(),
  isExecuting: false,

  // --- Manipulations de Base du Graphe ---
  setNodes: (nodes) => {
    const resolvedNodes = typeof nodes === 'function' ? nodes(get().nodes) : nodes;
    set({ nodes: resolvedNodes });
  },

  setEdges: (edges) => {
    const resolvedEdges = typeof edges === 'function' ? edges(get().edges) : edges;
    set({ edges: resolvedEdges });
  },

  addNode: (node: Node) => {
    if (!isValidNode(node)) {
        console.error("Tentative d'ajout d'un nœud invalide:", node);
        return;
    }
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
  },

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  })),

  duplicateNode: (nodeId) => {
    const nodeToClone = get().nodes.find(n => n.id === nodeId);
    if (!nodeToClone || !isValidNode(nodeToClone)) { // Vérifier aussi la validité du nœud à cloner
        console.error("Tentative de duplication d'un nœud invalide ou non trouvé:", nodeId);
        return;
    }

    const newNodeId = `${nodeToClone.type}_${Date.now()}`;
    const newNode: Node = {
      ...nodeToClone,
      id: newNodeId,
      position: {
        x: nodeToClone.position.x + 50,
        y: nodeToClone.position.y + 50
      },
      data: { ...nodeToClone.data, label: `${nodeToClone.data.label || nodeToClone.type} (copy)` }
    };

    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  deleteNode: (nodeId) => {
    const { scheduleIntervals } = get();
    if (scheduleIntervals.has(nodeId)) {
      clearInterval(scheduleIntervals.get(nodeId)!);
      scheduleIntervals.delete(nodeId);
      set({ scheduleIntervals: new Map(scheduleIntervals) });
    }

    set((state) => ({
      nodes: state.nodes.filter(n => n.id !== nodeId),
      edges: state.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    }));
  },

  // --- Mise à Jour des Nœuds ---
  updateNodeName: (nodeId: string, newName: string) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      )
    }));
  },

  updateNodeData: (nodeId: string, data: any) => {
    set((state) => ({
      nodes: state.nodes.map(node =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      )
    }));
  },

   // --- Gestion des Statuts et Compteurs ---
   updateNodeStatus: (nodeId, status) => {
    set((state) => {
      const newStatuses = new Map(state.nodeStatuses);
      newStatuses.set(nodeId, { status, timestamp: Date.now() });
      return { nodeStatuses: newStatuses };
    });
  },

  // NOTE: Fonction renommée et appelée en interne par executeNode
  incrementNodeExecutionCounter: (nodeType: string) => {
    console.log('incrementNodeExecutionCounter appelé avec:', nodeType);
    
    if (!nodeType || typeof nodeType !== 'string') {
        console.warn("Tentative d'incrémenter le compteur avec un type invalide:", nodeType);
        return;
    }

    const beforeState = get().nodeExecutionCounters;
    console.log('État avant incrémentation:', Object.fromEntries(beforeState));

    set((state) => {
      console.log('Entrée dans set avec state:', state);
      const newCounters = new Map(state.nodeExecutionCounters);
      const currentCount = newCounters.get(nodeType) || 0;
      newCounters.set(nodeType, currentCount + 1);
      console.log(`[Counter] Incrémenté ${nodeType}: ${currentCount + 1}`);
      return { nodeExecutionCounters: newCounters };
    });

    const afterState = get().nodeExecutionCounters;
    console.log('État après incrémentation:', Object.fromEntries(afterState));
  },

  updateCounterNode: (nodeId: string, increment: boolean) => {
    set((state) => {
      const node = state.nodes.find(n => n.id === nodeId);
      if (!node || node.type !== 'counter') return state;

      const step = parseInt(node.data.step?.toString() || '1', 10);
      const max = parseInt(node.data.max?.toString() || '999', 10);
      const min = parseInt(node.data.min?.toString() || '0', 10);
      const wrap = node.data.wrap === true;
      const currentCount = node.data.count ?? node.data.initialValue ?? 0;

      let newCount = increment ? currentCount + step : currentCount - step;
      
      if (newCount > max) {
        newCount = wrap ? min : max;
      } else if (newCount < min) {
        newCount = wrap ? max : min;
      }

      const updatedNodes = state.nodes.map(n => 
        n.id === nodeId 
          ? { ...n, data: { ...n.data, count: newCount } }
          : n
      );

      return { nodes: updatedNodes };
    });
  },

  // --- Logique d'Exécution ---
  stopExecution: () => {
    const { scheduleIntervals } = get();
    console.log("Arrêt de l'exécution. Nettoyage des intervalles:", scheduleIntervals.size);
    scheduleIntervals.forEach((interval) => clearInterval(interval));

    set((state) => {
      const newStatuses = new Map<string, { status: NodeStatus, timestamp: number }>();
      state.nodes.forEach(node => {
        newStatuses.set(node.id, { status: 'idle', timestamp: Date.now() });
      });

      return {
        isExecuting: false,
        executingNodes: new Set<string>(),
        scheduleIntervals: new Map<string, NodeJS.Timeout>(),
        nodeStatuses: newStatuses,
        // Les compteurs ne sont PAS réinitialisés ici par défaut
      };
    });
  },

  executeWorkflow: async (startNodeIds: string[]) => {
    const { stopExecution, nodes } = get();
    stopExecution();

    const validStartNodes = startNodeIds.filter(id => nodes.some(n => n.id === id && isValidNode(n))); // Vérifier validité
    if (validStartNodes.length === 0) {
        console.warn("executeWorkflow appelé sans nœuds de départ valides.");
        return;
    }

    console.log("Démarrage de l'exécution du workflow depuis les nœuds:", validStartNodes);
    set({ isExecuting: true });

    const executionPromises = validStartNodes.map(nodeId =>
      get().executeNode(nodeId, { isScheduled: false }) // Contexte initial
    );

    try {
        await Promise.all(executionPromises);
        console.log("Appels d'exécution initiaux terminés.");
    } catch (error) {
        console.error("Erreur durant l'exécution initiale du workflow:", error);
        get().stopExecution();
    }
  },

  executeNode: async (nodeId: string, context = { isScheduled: false }) => {
    // Utilisation des fonctions du store directement
    const { nodes, edges, executingNodes, scheduleIntervals, updateNodeStatus, incrementNodeExecutionCounter, isExecuting: currentIsExecuting } = get();
    const node = nodes.find(n => n.id === nodeId);

    // 1. Validation et Vérifications
    if (!node || !isValidNode(node)) {
      console.warn(`executeNode: Nœud non trouvé ou invalide: ${nodeId}`);
      return;
    }
    // Vérifier l'état isExecuting récupéré au début de la fonction
    if (!currentIsExecuting) {
        console.log(`executeNode: Exécution stoppée globalement, arrêt du nœud ${nodeId}`);
        return;
    }
    if (executingNodes.has(nodeId)) {
      console.log(`executeNode: Nœud ${nodeId} déjà en cours d'exécution, évitement de boucle`);
      return; // Évite boucle simple
    }

    // Variable pour suivre si on doit continuer l'exécution
    let shouldContinue = true;

    try {
      // 2. Marquage et Statut
      executingNodes.add(nodeId);
      updateNodeStatus(nodeId, 'running'); // Appel interne

      // 3. Incrémentation du Compteur (si applicable)
      if (!context.isScheduled && node.type && shouldContinue) {
        incrementNodeExecutionCounter(node.type); // Appel interne
      }

      // 4. Logique Spécifique au Type
      if (node.type === 'webhook') {
        console.log(`Démarrage de l'écoute du webhook pour le nœud ${nodeId}`);
        
        try {
          // Marquer le nœud comme en écoute
          updateNodeStatus(nodeId, 'running');

          // Fonction de callback pour le webhook
          const handleWebhook = async (data: any) => {
            console.log(`Webhook ${nodeId} déclenché avec les données:`, data);

            // Exécuter les nœuds suivants avec les données reçues
            const outgoingEdges = edges.filter(e => e.source === nodeId);
            for (const edge of outgoingEdges) {
              if (!shouldContinue || !get().isExecuting) break;
              get().updateNodeData(edge.target, { ...nodes.find(n => n.id === edge.target)?.data, input: data });
              await get().executeNode(edge.target, context);
            }
          };

          // Démarrer l'écoute
          console.log(`Webhook ${nodeId} en attente de déclenchement`);

          // Retourner une promesse qui ne se résout jamais tant que le workflow est actif
          await new Promise(() => {});

        } catch (error) {
          console.error(`Erreur de configuration du webhook:`, error);
          updateNodeStatus(nodeId, 'error');
          throw error;
        }

      } else if (node.type === 'sendEmail') {
        console.log(`Envoi d'email depuis le nœud ${nodeId}`);
        
        try {
          const { to, subject, message } = node.data;
          
          if (!to || !subject || !message) {
            throw new Error('Champs email incomplets');
          }

          // Préparation des données pour le webhook
          const webhookData = {
            to: to,
            from: 'xenatronics@gmx.fr',
            subject: subject,
            message: message + '\n\nRépondre à : ' + to, // Ajout de l'adresse de réponse
          };

          // Envoi via webhook
          const response = await fetch('https://webhook.site/YOUR-WEBHOOK-URL', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(webhookData)
          });

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          console.log('Email envoyé avec succès');
          updateNodeStatus(nodeId, 'success');

          // Exécuter les nœuds suivants
          const outgoingEdges = edges.filter(e => e.source === nodeId);
          for (const edge of outgoingEdges) {
            if (!shouldContinue || !get().isExecuting) break;
            await get().executeNode(edge.target, context);
          }

        } catch (error) {
          console.error(`Erreur d'envoi d'email:`, error);
          updateNodeStatus(nodeId, 'error');
          throw error;
        }

      } else if (node.type === 'schedule') {
        // --- Logique Schedule ---
        const existingInterval = scheduleIntervals.get(nodeId);
        if (existingInterval) clearInterval(existingInterval);

        if (node.data?.active !== true && node.data?.active !== 'true') {
            updateNodeStatus(nodeId, 'warning');
            executingNodes.delete(nodeId);
            return;
        }

        // Calcul intervalMs... (idem qu'avant)
        const intervalValue = parseInt(node.data?.intervalValue || '5', 10);
        const intervalUnit = node.data?.intervalUnit || 'seconds';
        let intervalMs = intervalValue * 1000;
        switch (intervalUnit) { /* ... cases ... */ }

        const executeScheduledNodes = async () => {
            // Re-vérifier isExecuting à chaque tick
            if (!get().isExecuting) {
                const currentInterval = get().scheduleIntervals.get(nodeId);
                if(currentInterval){
                    clearInterval(currentInterval);
                    get().scheduleIntervals.delete(nodeId);
                    set({ scheduleIntervals: new Map(get().scheduleIntervals) });
                }
                return;
            }
            updateNodeStatus(nodeId, 'running');

            const outgoingEdges = get().edges.filter(e => e.source === nodeId);
            const targetNodeIds = outgoingEdges.map(e => e.target);

            for (const targetId of targetNodeIds) {
                await get().executeNode(targetId, { isScheduled: true }); // Contexte planifié
            }
            // Vérifier si le statut n'a pas changé (ex: erreur dans un enfant)
             if(get().nodeStatuses.get(nodeId)?.status === 'running') {
                updateNodeStatus(nodeId, 'success');
            }
        };

        if (node.data?.initialBehavior === 'execute' && !context.isScheduled) {
           await executeScheduledNodes();
        }

        const newInterval = setInterval(executeScheduledNodes, intervalMs);
        scheduleIntervals.set(nodeId, newInterval);
        set({ scheduleIntervals: new Map(scheduleIntervals) });
        updateNodeStatus(nodeId, 'success');

      } else if (node.type === 'ifCondition') {
        // --- Logique If Condition ---
        console.log(`Évaluation de la condition pour ${nodeId}`);
        console.log('Expression à évaluer:', node.data?.description);
        
        let conditionResult = false;
        try {
          // Évaluer l'expression si elle existe
          if (node.data?.description) {
            // Pour l'instant, on évalue directement l'expression
            // Plus tard, on pourra ajouter un contexte avec des variables
            const evalResult = eval(node.data.description);
            console.log('Résultat brut de eval:', evalResult);
            conditionResult = Boolean(evalResult);
          } else {
            console.log('Aucune expression à évaluer, utilisation de la valeur par défaut (true)');
            conditionResult = true; // Par défaut, on va sur la branche true s'il n'y a pas d'expression
          }
        } catch (error) {
          console.error(`Erreur d'évaluation de l'expression pour ${nodeId}:`, error);
          updateNodeStatus(nodeId, 'error');
          throw error;
        }

        console.log(`Résultat de la condition: ${conditionResult}`);
        updateNodeStatus(nodeId, 'success');

        // Trouver les arêtes sortantes avec l'ID correspondant au résultat
        const outgoingEdges = edges.filter(e => 
          e.source === nodeId && 
          e.sourceHandle === (conditionResult ? 'true' : 'false')
        );

        // Exécuter les nœuds cibles de la branche choisie avec les données d'entrée
        const inputData = node.data?.input || {};
        for (const edge of outgoingEdges) {
          // Trouver le nœud cible
          const targetNode = nodes.find(n => n.id === edge.target);
          if (targetNode) {
            // Mettre à jour les données du nœud cible avec les données d'entrée
            get().updateNodeData(targetNode.id, { ...targetNode.data, input: inputData });
            await get().executeNode(edge.target, context);
          }
        }

      } else {
        // --- Logique pour AUTRES Nœuds ---
        console.log(`Exécution du nœud standard ${nodeId} (Type: ${node.type})`);
        
        // Vérifier si on est toujours en cours d'exécution
        if (!get().isExecuting) {
          shouldContinue = false;
          return;
        }

        await new Promise(resolve => {
          const timeoutId = setTimeout(() => {
            if (get().isExecuting) {
              resolve(undefined);
            }
          }, 50 + Math.random() * 100);

          // Nettoyer le timeout si l'exécution est arrêtée
          return () => clearTimeout(timeoutId);
        });

        if (!shouldContinue || !get().isExecuting) return;

        updateNodeStatus(nodeId, 'success');

        const outgoingEdges = edges.filter(e => e.source === nodeId);
        const targetNodeIds = outgoingEdges.map(e => e.target);

        for (const targetId of targetNodeIds) {
          if (!shouldContinue || !get().isExecuting) break;
          await get().executeNode(targetId, context); // Propager le contexte
        }
      }

    } catch (error) {
      console.error(`Erreur durant l'exécution du nœud ${nodeId}:`, error);
      updateNodeStatus(nodeId, 'error');
    } finally {
      // 5. Nettoyage
      if (executingNodes.has(nodeId)) {
        executingNodes.delete(nodeId);
        console.log(`Nœud ${nodeId} retiré de la liste d'exécution`);
      }

      // Vérifier si l'exécution doit se terminer
      const currentExecutingNodes = get().executingNodes;
      const currentScheduleIntervals = get().scheduleIntervals;

      if (currentExecutingNodes.size === 0 && currentScheduleIntervals.size === 0) {
        console.log("Exécution du workflow terminée (pas de nœuds actifs ni de schedules).");
        if (get().isExecuting) {
          console.log("Arrêt de l'exécution globale");
          set({ isExecuting: false });
        }
      } else {
        console.log(`Nœuds encore en cours: ${currentExecutingNodes.size}, Schedules actifs: ${currentScheduleIntervals.size}`);
      }
    }
  },

  // --- Persistance ---
  saveWorkflow: async () => {
    try {
      const { nodes, edges, nodeExecutionCounters } = get();
      const countersObject = Object.fromEntries(nodeExecutionCounters);
      const workflowData = { nodes, edges, metadata: { nodeExecutionCounters: countersObject } };
      localStorage.setItem('workflow_v2', JSON.stringify(workflowData));
      console.log("Workflow sauvegardé.");
    } catch (error) {
      console.error("Erreur sauvegarde workflow:", error);
    }
  },

  loadWorkflow: () => {
    try {
      const savedWorkflow = localStorage.getItem('workflow_v2');
      if (savedWorkflow) {
        const { nodes, edges, metadata } = JSON.parse(savedWorkflow);

        if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new Error("Format invalide.");
        const validNodes = nodes.filter(isValidNode);
        // Gérer les nœuds filtrés...

        let countersMap = new Map<string, number>();
        if (metadata?.nodeExecutionCounters && typeof metadata.nodeExecutionCounters === 'object') {
            Object.entries(metadata.nodeExecutionCounters).forEach(([key, value]) => {
                if (typeof key === 'string' && typeof value === 'number') countersMap.set(key, value);
            });
        }

        set({
          nodes: validNodes,
          edges,
          nodeExecutionCounters: countersMap,
          executingNodes: new Set(), nodeStatuses: new Map(), scheduleIntervals: new Map(), isExecuting: false,
        });
        console.log("Workflow chargé.");
      }
    } catch (error) {
      console.error("Erreur chargement workflow:", error);
      set({ nodes: [], edges: [], nodeExecutionCounters: new Map(), /* ... reset ... */ });
    }
  },

  exportWorkflow: async () => {
    const { nodes, edges, nodeExecutionCounters } = get();
    const countersObject = Object.fromEntries(nodeExecutionCounters);
    return { nodes, edges, metadata: { nodeExecutionCounters: countersObject } };
  },

  importWorkflow: async (workflow: { nodes: Node[]; edges: Edge[]; metadata?: any }) => {
    try {
      const { nodes, edges, metadata } = workflow;

      if (!Array.isArray(nodes) || !Array.isArray(edges)) throw new Error("Format invalide.");
      const validNodes = nodes.filter(isValidNode);
      // Gérer les nœuds filtrés...

      let countersMap = new Map<string, number>();
      if (metadata?.nodeExecutionCounters && typeof metadata.nodeExecutionCounters === 'object') {
         Object.entries(metadata.nodeExecutionCounters).forEach(([key, value]) => {
             if (typeof key === 'string' && typeof value === 'number') countersMap.set(key, value);
         });
      }

      set({
        nodes: validNodes,
        edges,
        nodeExecutionCounters: countersMap,
        executingNodes: new Set(), nodeStatuses: new Map(), scheduleIntervals: new Map(), isExecuting: false,
      });
      console.log("Workflow importé.");

    } catch (error) {
      console.error('Erreur import workflow:', error);
      throw error;
    }
  },

}));

export default useWorkflowStore;