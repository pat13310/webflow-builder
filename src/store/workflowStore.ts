import { create } from "zustand";
import { Node, Edge } from "reactflow";

import { executeWebhook, WebhookData } from "./webhookStore";
import useCounterStore from "./counterStore";
import useCounterValuesStore from "./counterValuesStore";
import useConsoleStore from "./consoleStore";
import { nodeTypes, NodeTypes } from "../components/nodes/nodeTypes";

type WorkflowNode = Node & {
  type: NodeTypes;
};

type NodeStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
  | "warning"
  | "validated";

interface ExecutionContext {
  type: "webhook" | "action";
  isScheduled?: boolean;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  shouldContinue?: boolean;
  webhookResult?: any; // Résultat du webhook précédent
  inputData?: any; // Données d'entrée pour le nœud
  counterValue?: number;
}

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  executingNodes: Set<string>; // IDs des nœuds en cours d'exécution
  nodeStatuses: Map<string, { status: NodeStatus; timestamp: number }>;
  scheduleIntervals: Map<string, NodeJS.Timeout>;
  isExecuting: boolean;

  // Fonctions de manipulation du graphe
  setNodes: (nodes: Node[] | ((prev: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
  deleteEdge: (edgeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  deleteNode: (nodeId: string) => void;

  // Fonctions d'exécution
  executeNode: (nodeId: string, context?: ExecutionContext) => Promise<void>;
  executeWorkflow: (startNodeIds: string[]) => Promise<void>;
  stopExecution: () => void;

  // Mise à jour des nœuds
  updateNodeName: (nodeId: string, newName: string) => void;
  updateNodeData: (nodeId: string, data: any) => void;

  // Fonction interne (appelée par d'autres actions du store)
  updateNodeStatus: (nodeId: string, status: NodeStatus) => void;

  // Persistance
  saveWorkflow: () => Promise<void>;
  loadWorkflow: () => void;
  exportWorkflow: () => Promise<{
    nodes: Node[];
    edges: Edge[];
    metadata: any;
  }>;
  importWorkflow: (workflow: {
    nodes: Node[];
    edges: Edge[];
    metadata?: any;
  }) => Promise<void>;
}

// Helper pour valider un type de nœud
export const isValidNodeType = (type: string): type is NodeTypes => {
  return Object.keys(nodeTypes).includes(type);
};

// Helper pour valider un nœud
const isValidNode = (node: any): node is WorkflowNode => {
  return (
    node &&
    typeof node === "object" &&
    typeof node.id === "string" &&
    typeof node.type === "string" &&
    isValidNodeType(node.type) && // Vérifier que le type est valide
    typeof node.position === "object" &&
    typeof node.position.x === "number" &&
    typeof node.position.y === "number" &&
    typeof node.data === "object"
  );
};

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  // --- État initial ---
  nodes: [],
  edges: [],
  isExecuting: false,
  executingNodes: new Set<string>(),
  nodeStatuses: new Map(),
  scheduleIntervals: new Map(),

  // --- Manipulations de base du graphe ---
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => {
    set(
      (state) => ({
        nodes: typeof nodes === "function" ? nodes(state.nodes) : nodes
      }),
      false
    );
  },

  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => {
    set(
      (state) => ({
        edges: typeof edges === "function" ? edges(state.edges) : edges
      }),
      false
    );
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

  addEdge: (edge: Edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
    }));
  },

  deleteEdge: (edgeId: string) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== edgeId),
    }));
  },

  duplicateNode: (nodeId: string) => {
    const nodeToClone = get().nodes.find((n) => n.id === nodeId);
    if (!nodeToClone || !isValidNode(nodeToClone)) {
      console.error(
        "Tentative de duplication d'un nœud invalide ou non trouvé:",
        nodeId
      );
      return;
    }

    const newNodeId = `${nodeToClone.type}_${Date.now()}`;
    const newNode: Node = {
      ...nodeToClone,
      id: newNodeId,
      position: {
        x: nodeToClone.position.x + 50,
        y: nodeToClone.position.y + 50,
      },
      data: {
        ...nodeToClone.data,
        label: `${nodeToClone.data.label || nodeToClone.type} (copy)`,
      },
    };

    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  deleteNode: (nodeId: string) => {
    const { scheduleIntervals } = get();
    if (scheduleIntervals.has(nodeId)) {
      clearInterval(scheduleIntervals.get(nodeId)!);
      scheduleIntervals.delete(nodeId);
      set({ scheduleIntervals: new Map(scheduleIntervals) });
    }

    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
    }));
  },

  // --- Mise à jour des nœuds ---
  updateNodeName: (nodeId: string, newName: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, label: newName } }
          : node
      ),
    }));
  },

  updateNodeData: (nodeId: string, data: any) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  // --- Gestion des statuts ---
  updateNodeStatus: (nodeId: string, status: NodeStatus) => {
    set((state) => {
      const newStatuses = new Map(state.nodeStatuses);
      newStatuses.set(nodeId, { status, timestamp: Date.now() });
      return { nodeStatuses: newStatuses };
    });
  },

  // --- Logique d'exécution ---
  stopExecution: () => {
    const { scheduleIntervals } = get();
    console.log(
      "Arrêt de l'exécution. Nettoyage des intervalles:",
      scheduleIntervals.size
    );
    scheduleIntervals.forEach((interval) => clearInterval(interval));

    set((state) => {
      const newStatuses = new Map<
        string,
        { status: NodeStatus; timestamp: number }
      >();
      state.nodes.forEach((node) => {
        newStatuses.set(node.id, { status: "idle", timestamp: Date.now() });
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

    const validStartNodes = startNodeIds.filter((id) =>
      nodes.some((n: Node) => n.id === id && isValidNode(n))
    );
    if (validStartNodes.length === 0) {
      console.warn("executeWorkflow appelé sans nœuds de départ valides.");
      return;
    }

    console.log(
      "Démarrage de l'exécution du workflow depuis les nœuds:",
      validStartNodes
    );
    set({ isExecuting: true });

    const executionPromises = validStartNodes.map(
      async (nodeId) =>
        await get().executeNode(nodeId, { type: "action", isScheduled: false })
    );

    try {
      await Promise.all(executionPromises);
      console.log("Appels d'exécution initiaux terminés.");
    } catch (error) {
      console.error("Erreur durant l'exécution initiale du workflow:", error);
      get().stopExecution();
    }
  },

  executeNode: async (
    nodeId: string,
    context: ExecutionContext = {
      type: "action",
      isScheduled: false,
      shouldContinue: true,
    }
  ) => {
    const state = get();
    const {
      nodes,
      edges,
      executingNodes,
      scheduleIntervals,
      isExecuting: currentIsExecuting,
    } = state;
    const node = nodes.find(
      (n): n is WorkflowNode => n.id === nodeId && isValidNode(n)
    );

    // 1. Validation et vérification
    if (!node) {
      console.warn(`executeNode: Nœud non trouvé ou invalide: ${nodeId}`);
      return;
    }

    // Vérifier si le nœud est connecté (sauf pour les triggers)
    const isConnected = edges.some(
      (edge: Edge) => edge.source === nodeId || edge.target === nodeId
    );
    if (
      !isConnected &&
      node.type &&
      !["webhook", "pushButton"].includes(node.type)
    ) {
      console.warn(`executeNode: Le nœud ${nodeId} n'est pas connecté`);
      return;
    }

    // Pour les webhooks, on ignore la vérification de isExecuting
    if (!currentIsExecuting && node.type !== "webhook") {
      console.log(
        `executeNode: Exécution stoppée globalement, arrêt du nœud ${nodeId}`
      );
      return;
    }
    if (executingNodes.has(nodeId)) {
      console.log(
        `executeNode: Nœud ${nodeId} déjà en cours d'exécution, évitement de boucle`
      );
      return;
    }

    let shouldContinue = context.shouldContinue ?? true;

    try {
      // 2. Marquage et statut
      executingNodes.add(nodeId);
      state.updateNodeStatus(nodeId, "running");
      console.log(
        `Exécution du nœud ${nodeId} (type: ${node.type}), shouldContinue: ${shouldContinue}`
      );

      // 4. Vérifier que le type est valide
      const nodeType = node.type as NodeTypes;
      if (!(nodeType in nodeTypes)) {
        console.error(`Type de nœud invalide: ${nodeType}`);
        state.updateNodeStatus(nodeId, "error");
        throw new Error(`Type de nœud non supporté: ${nodeType}`);
      }

      // 5. Logique spécifique au type de nœud
      if (nodeType === "pushButton") {
        // Le nœud pushButton passe en success pendant 1 seconde
        state.updateNodeStatus(nodeId, "success");
        // Incrémentation du compteur après succès
        if (!context.isScheduled) {
          useCounterStore.getState().incrementNodeCounter("pushButton");
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        state.updateNodeStatus(nodeId, "idle");
        executingNodes.delete(nodeId);

        // Propager l'exécution aux nœuds connectés
        const connectedNodes = edges
          .filter((edge) => edge.source === nodeId)
          .map((edge) => edge.target);

        for (const targetNodeId of connectedNodes) {
          await state.executeNode(targetNodeId, {
            ...context,
            shouldContinue: true,
          });
        }
        return;
      } else if (node.type === "webhook") {
        console.log(
          `Démarrage de l'exécution du webhook pour le nœud ${nodeId}`
        );
        if (nodeId.startsWith("webhook-webhook-")) {
          console.warn(
            `Attention: Le nœud ${nodeId} a un préfixe 'webhook-' dupliqué`
          );
          const correctedNodeId = nodeId.replace(
            "webhook-webhook-",
            "webhook-"
          );
          console.log(`Correction du nodeId: ${nodeId} -> ${correctedNodeId}`);
          nodeId = correctedNodeId;
        }

        console.log(`Configuration du webhook pour le nœud ${nodeId}:`, {
          url: node.data.url,
          method: node.data.method || "GET",
          headersCount: Object.keys(node.data.headers || {}).length,
          hasBody: !!node.data.body,
        });

        const webhookData: WebhookData = {
          nodeId: node.id,
          url: node.data.url || "",
          method: node.data.method || "GET",
          headers: node.data.headers || {},
          body: node.data.body,
        };

        try {
          console.log(`Exécution du webhook pour le nœud ${nodeId}...`);
          const { result, url: updatedUrl } = await executeWebhook(webhookData);

          // Mise à jour des données du nœud webhook
          const timeStr = new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          get().updateNodeData(nodeId, {
            ...node.data,
            url: updatedUrl,
            lastExecutionTime: timeStr,
          });

          state.updateNodeStatus(nodeId, "success");
          console.log(`Statut mis à jour: success pour le nœud ${nodeId}`);

          // Propagation vers les nœuds suivants en incluant l'état validé
          const targetEdges = edges.filter((edge) => edge.source === nodeId);
          for (const edge of targetEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (targetNode) {
              get().updateNodeData(targetNode.id, {
                ...targetNode.data,
                inputData: {
                  ...targetNode.data.inputData,
                  result: result,
                  validated: true, // Marque explicitement que le webhook a été validé
                },
              });
              await get().executeNode(targetNode.id, {
                type: "action",
                shouldContinue: true,
                webhookResult: result,
              });
            }
          }

          state.updateNodeStatus(nodeId, "validated");
          return result;
        } catch (error) {
          console.error(`Erreur lors de l'exécution du webhook:`, error);
          state.updateNodeStatus(nodeId, "error");
          throw error;
        }
      } else if (node.type === "email") {
        console.log(`Envoi d'email depuis le nœud ${nodeId}`);
        try {
          const { to, subject, message } = node.data;
          if (!to || !subject || !message) {
            throw new Error("Champs email incomplets");
          }

          const webhookData = {
            to,
            from: "xenatronics@gmx.fr",
            subject,
            message: message + "\n\nRépondre à : " + to,
          };

          const response = await fetch(
            "https://webhook.site/YOUR-WEBHOOK-URL",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(webhookData),
            }
          );

          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }

          console.log("Email envoyé avec succès");
          state.updateNodeStatus(nodeId, "success");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          state.updateNodeStatus(nodeId, "idle");
          executingNodes.delete(nodeId);

          const outgoingEdges = edges.filter((e) => e.source === nodeId);
          for (const edge of outgoingEdges) {
            if (!context.shouldContinue || !get().isExecuting) break;
            await get().executeNode(edge.target, {
              type: "action",
              isScheduled: false,
              shouldContinue: true,
            });
          }
        } catch (error) {
          console.error(`Erreur d'envoi d'email:`, error);
          state.updateNodeStatus(nodeId, "error");
          throw error;
        }
      } else if (nodeType === ("console" as NodeTypes)) {
        try {
          let message = "Aucune donnée";

          if (context.counterValue !== undefined) {
            message = `Valeur du compteur: ${context.counterValue}`;
          } else if (context.webhookResult) {
            message = context.webhookResult;
          } else if (context.inputData) {
            message = context.inputData;
          }

          useConsoleStore.getState().appendToConsole(nodeId, message);
          state.updateNodeStatus(nodeId, "success");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          state.updateNodeStatus(nodeId, "idle");
          executingNodes.delete(nodeId);

          // Propager l'exécution aux nœuds connectés
          const outgoingEdges = edges.filter((e) => e.source === nodeId);
          const targetNodeIds = outgoingEdges.map((e) => e.target);

          for (const targetNodeId of targetNodeIds) {
            await state.executeNode(targetNodeId, {
              ...context,
              type: "action",
              shouldContinue: true,
            });
          }

          // Incrémentation du compteur après succès
          if (!context.isScheduled) {
            useCounterStore.getState().incrementNodeCounter("console");
          }
        } catch (error) {
          console.error(`Erreur dans le nœud console:`, error);
          state.updateNodeStatus(nodeId, "error");
          throw error;
        }
      } else if (nodeType === ("webhook" as NodeTypes)) {
        try {
          const response = await executeWebhook(node.data as WebhookData);
          context.webhookResult = response;
          state.updateNodeStatus(nodeId, "success");
          // Incrémentation du compteur après succès
          if (!context.isScheduled) {
            useCounterStore.getState().incrementNodeCounter("webhook");
          }
        } catch (error) {
          console.error(`Erreur dans le nœud webhook:`, error);
          state.updateNodeStatus(nodeId, "error");
          throw error;
        }
      } else if (nodeType === ("counter" as NodeTypes)) {
        try {
          // Récupérer les paramètres du compteur
          const { step = 1, min, max, wrap = false } = node.data;

          // Récupérer la valeur actuelle
          const counterStore = useCounterValuesStore.getState();
          const currentValue = counterStore.getValue(nodeId);
          let newValue = currentValue + step;

          // Gérer les limites et le wrap
          if (max !== undefined && newValue > max) {
            newValue = wrap ? min || 0 : max;
          }
          if (min !== undefined && newValue < min) {
            newValue = wrap ? max || 0 : min;
          }

          // Mettre à jour la valeur
          counterStore.setValue(nodeId, newValue);
          state.updateNodeStatus(nodeId, "success");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          state.updateNodeStatus(nodeId, "idle");
          executingNodes.delete(nodeId);

          // Propager l'exécution aux nœuds connectés
          const outgoingEdges = edges.filter((e) => e.source === nodeId);
          const targetNodeIds = outgoingEdges.map((e) => e.target);

          for (const targetNodeId of targetNodeIds) {
            await state.executeNode(targetNodeId, {
              ...context,
              type: "action",
              shouldContinue: true,
              counterValue: newValue,
            });
          }
        } catch (error) {
          console.error(`Erreur dans le nœud counter:`, error);
          state.updateNodeStatus(nodeId, "error");
          throw error;
        }
      } else if (node.type === ("schedule" as NodeTypes)) {
        // --- Logique Schedule ---
        const existingInterval = scheduleIntervals.get(nodeId);
        if (existingInterval) clearInterval(existingInterval);

        if (node.data?.active !== true && node.data?.active !== "true") {
          state.updateNodeStatus(nodeId, "warning");
          executingNodes.delete(nodeId);
          return;
        }

        // Calcul de l'intervalle en millisecondes en fonction de l'unité
        const intervalValue = parseInt(node.data?.intervalValue || "5", 10);
        const intervalUnit = node.data?.intervalUnit || "seconds";
        let intervalMs = intervalValue * 1000;
        switch (intervalUnit) {
          case "seconds":
            intervalMs = intervalValue * 1000;
            break;
          case "minutes":
            intervalMs = intervalValue * 60 * 1000;
            break;
          case "hours":
            intervalMs = intervalValue * 3600 * 1000;
            break;
          default:
            intervalMs = intervalValue * 1000;
        }

        const executeScheduledNodes = async () => {
          if (!get().isExecuting) {
            const currentInterval = get().scheduleIntervals.get(nodeId);
            if (currentInterval) {
              clearInterval(currentInterval);
              get().scheduleIntervals.delete(nodeId);
              set({ scheduleIntervals: new Map(get().scheduleIntervals) });
            }
            return;
          }
          state.updateNodeStatus(nodeId, "running");

          const outgoingEdges = get().edges.filter((e) => e.source === nodeId);
          const targetNodeIds = outgoingEdges.map((e) => e.target);

          for (const targetId of targetNodeIds) {
            await get().executeNode(targetId, {
              type: "action",
              isScheduled: true,
            });
          }
          if (get().nodeStatuses.get(nodeId)?.status === "running") {
            state.updateNodeStatus(nodeId, "success");
          }
        };

        if (node.data?.initialBehavior === "execute" && !context.isScheduled) {
          await executeScheduledNodes();
        }

        const newInterval = setInterval(executeScheduledNodes, intervalMs);
        scheduleIntervals.set(nodeId, newInterval);
        set({ scheduleIntervals: new Map(scheduleIntervals) });
        state.updateNodeStatus(nodeId, "success");
        // Incrémentation du compteur après succès
        if (!context.isScheduled) {
          useCounterStore.getState().incrementNodeCounter("schedule");
        }
      } else if (node.type === "ifCondition") {
        // --- Logique If Condition ---
        console.log(`Évaluation de la condition pour ${nodeId}`);
        console.log("Expression à évaluer:", node.data?.description);

        // ... (le reste du code reste inchangé)
        let conditionResult = false;
        try {
          if (node.data?.description) {
            const evalResult = eval(node.data.description);
            console.log("Résultat brut de eval:", evalResult);
            conditionResult = Boolean(evalResult);
          } else {
            console.log(
              "Aucune expression à évaluer, utilisation de la valeur par défaut (true)"
            );
            conditionResult = true;
          }
        } catch (error) {
          console.error(
            `Erreur d'évaluation de l'expression pour ${nodeId}:`,
            error
          );
          state.updateNodeStatus(nodeId, "error");
          throw error;
        }

        console.log(`Résultat de la condition: ${conditionResult}`);
        state.updateNodeStatus(nodeId, "success");

        const outgoingEdges = edges.filter(
          (e) =>
            e.source === nodeId &&
            e.sourceHandle === (conditionResult ? "true" : "false")
        );

        const inputData = node.data?.input || {};
        for (const edge of outgoingEdges) {
          const targetNode = nodes.find((n) => n.id === edge.target);
          if (targetNode) {
            get().updateNodeData(targetNode.id, {
              ...targetNode.data,
              input: inputData,
            });
            await get().executeNode(edge.target, context);
          }
        }
      } else {
        // --- Logique pour les autres nœuds ---
        console.log(
          `Exécution du nœud standard ${nodeId} (Type: ${node.type})`
        );
        if (!get().isExecuting) {
          shouldContinue = false;
          return;
        }

        await new Promise((resolve) => {
          const timeoutId = setTimeout(() => {
            if (get().isExecuting) {
              resolve(undefined);
            }
          }, 50 + Math.random() * 100);

          return () => clearTimeout(timeoutId);
        });

        if (!shouldContinue || !get().isExecuting) return;

        state.updateNodeStatus(nodeId, "success");

        const outgoingEdges = edges.filter((e) => e.source === nodeId);
        const targetNodeIds = outgoingEdges.map((e) => e.target);

        for (const targetId of targetNodeIds) {
          if (!shouldContinue || !get().isExecuting) break;
          await get().executeNode(targetId, context);
        }
      }
    } catch (error) {
      console.error(`Erreur durant l'exécution du nœud ${nodeId}:`, error);
      state.updateNodeStatus(nodeId, "error");
    } finally {
      if (executingNodes.has(nodeId)) {
        executingNodes.delete(nodeId);
        console.log(`Nœud ${nodeId} retiré de la liste d'exécution`);
      }

      const currentExecutingNodes = get().executingNodes;
      const currentScheduleIntervals = get().scheduleIntervals;

      if (
        currentExecutingNodes.size === 0 &&
        currentScheduleIntervals.size === 0
      ) {
        console.log(
          "Exécution du workflow terminée (pas de nœuds actifs ni de schedules)."
        );
        if (get().isExecuting) {
          console.log("Arrêt de l'exécution globale");
          set({ isExecuting: false });
        }
      } else {
        console.log(
          `Nœuds encore en cours: ${currentExecutingNodes.size}, Schedules actifs: ${currentScheduleIntervals.size}`
        );
      }
    }
  },

  // --- Persistance ---
  saveWorkflow: async () => {
    try {
      const { nodes, edges } = get();
      const counters = useCounterStore.getState().nodeExecutionCounts;
      const countersObject = Object.fromEntries(counters);
      const workflowData = {
        nodes,
        edges,
        metadata: { nodeExecutionCounters: countersObject },
      };
      localStorage.setItem("workflow_v2", JSON.stringify(workflowData));
      console.log("Workflow sauvegardé.");
    } catch (error) {
      console.error("Erreur sauvegarde workflow:", error);
    }
  },

  loadWorkflow: () => {
    try {
      const savedWorkflow = localStorage.getItem("workflow_v2");
      if (savedWorkflow) {
        const savedState = JSON.parse(savedWorkflow);
        const { nodes, edges, metadata } = savedState;

        if (!Array.isArray(nodes) || !Array.isArray(edges))
          throw new Error("Format invalide.");
        const validNodes = nodes.filter(isValidNode);

        if (metadata?.nodeExecutionCounters) {
          const counterStore = useCounterStore.getState();
          Object.entries(metadata.nodeExecutionCounters).forEach(
            ([key, value]) => {
              if (
                typeof key === "string" &&
                typeof value === "number" &&
                isValidNodeType(key)
              ) {
                for (let i = 0; i < value; i++) {
                  counterStore.incrementNodeCounter(key as NodeTypes);
                }
              }
            }
          );
        }

        set({
          nodes: validNodes,
          edges: edges,
          executingNodes: new Set(),
          nodeStatuses: new Map(),
          scheduleIntervals: new Map(),
          isExecuting: false,
        });
        console.log("Workflow chargé.");
      }
    } catch (error) {
      console.error("Erreur chargement workflow:", error);
      set({
        nodes: [],
        edges: [],
        executingNodes: new Set(),
        nodeStatuses: new Map(),
        scheduleIntervals: new Map(),
        isExecuting: false,
      });
    }
  },

  exportWorkflow: async () => {
    const { nodes, edges } = get();
    const counters = useCounterStore.getState().nodeExecutionCounts;
    const countersObject = Object.fromEntries(counters);
    return {
      nodes,
      edges,
      metadata: { nodeExecutionCounters: countersObject },
    };
  },

  importWorkflow: async (workflow: {
    nodes: Node[];
    edges: Edge[];
    metadata?: any;
  }) => {
    try {
      if (!Array.isArray(workflow.nodes) || !Array.isArray(workflow.edges)) {
        throw new Error("Format de workflow invalide");
      }

      const validNodes = workflow.nodes.filter(isValidNode);

      if (workflow.metadata?.nodeExecutionCounters) {
        const counterStore = useCounterStore.getState();
        Object.entries(workflow.metadata.nodeExecutionCounters).forEach(
          ([key, value]) => {
            if (
              typeof key === "string" &&
              typeof value === "number" &&
              isValidNodeType(key)
            ) {
              for (let i = 0; i < value; i++) {
                counterStore.incrementNodeCounter(key as NodeTypes);
              }
            } else {
              console.warn(`Type de nœud invalide ignoré: ${key}`);
            }
          }
        );
      }

      set({
        nodes: validNodes,
        edges: workflow.edges,
        executingNodes: new Set(),
        nodeStatuses: new Map(),
        scheduleIntervals: new Map(),
        isExecuting: false,
      });
      console.log("Workflow importé.");
    } catch (error: any) {
      console.error("Erreur import workflow:", error);
      throw error;
    }
  },
}));

export default useWorkflowStore;
