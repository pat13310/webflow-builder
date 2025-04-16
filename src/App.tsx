import React, { useCallback, useRef, useState, lazy, Suspense,  useMemo } from 'react';

import { NodeChange, EdgeChange } from 'reactflow';
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
// PropertiesPanel est importé via lazy loading
import { motion, AnimatePresence } from 'framer-motion';
import 'reactflow/dist/style.css';
import './styles/edges.css';
import './styles/dark-theme.css';

// Lazy load components
const Header = lazy(() => import('./components/Header.tsx'));
const Sidebar = lazy(() => import('./components/Sidebar.tsx'));
const PropertiesPanel = lazy(() => import('./components/PropertiesPanel.tsx'));


import { nodeTypes } from './components/NodeTypes.tsx';
import type { NodeTypes } from './components/nodes/nodeTypes';
import EdgeWithDelete from './components/edges/EdgeWithDelete';
import useWorkflowStore from './store/workflowStore.ts';
import useCounterStore from './store/counterStore.ts'; 
import { useTheme } from './hooks/useTheme.ts';
import FancyLoader from './components/FancyLoader.tsx';
import { isValidNodeType } from './store/workflowStore.ts';

// Définition des types de bords et options en dehors du composant pour éviter les re-rendus
const edgeTypes = {
  default: EdgeWithDelete,
} as const;

const edgeOptions = {
  style: { stroke: '#94a3b8', strokeWidth: 1 },
  type: 'smoothstep',
  animated: false,
} as const;

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const { nodes, edges, setNodes, setEdges, addNode, updateNodeData } = useWorkflowStore();

  // Mise à jour des edges avec la classe selected
  const edgesWithSelection = useMemo(() => 
    edges.map(edge => ({
      ...edge,
      selected: edge.id === selectedEdge
    })),
    [edges, selectedEdge]
  );

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => {
      const newNodes = applyNodeChanges(changes, nds);
      
      // N'arrondir que si les positions ont réellement changé
      return newNodes.map(node => {
        const roundedX = Math.round(node.position.x);
        const roundedY = Math.round(node.position.y);
        
        // Vérifier si l'arrondi est nécessaire
        if (roundedX === node.position.x && roundedY === node.position.y) {
          return node; // Pas besoin d'arrondir, évite la boucle infinie
        }
        
        return {
          ...node,
          position: {
            x: roundedX,
            y: roundedY
          }
        };
      });
    });
  }, [setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    for (const change of changes) {
      if (change.type === 'select') {
        setSelectedEdge(change.selected ? change.id : null);
        return;
      }
    }
    requestAnimationFrame(() => {
      setEdges(eds => applyEdgeChanges(changes, eds));
    });
  }, [setEdges, setSelectedEdge]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const edge: Edge = {
          id: `edge-${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          type: 'default',
          sourceHandle: params.sourceHandle || undefined,
          targetHandle: params.targetHandle || undefined
        };
        setEdges(addEdge(edge, edges));
      }
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const droppedType = event.dataTransfer.getData('application/reactflow');
      if (!isValidNodeType(droppedType)) return;

      const type = droppedType as NodeTypes;
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
        y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
      });

      // Récupérer le compteur actuel
      const currentCounter = useCounterStore.getState().getNodeExecutionCount(type);
      const newNodeId = currentCounter + 1;
      
      // Mettre à jour le compteur
      useCounterStore.getState().incrementNodeCounter(type as NodeTypes);
      const newNode = {
        id: `${type}-${newNodeId}`,
        type,
        position,
        data: { 
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} ${newNodeId}`,
          active: type === 'schedule' ? true : undefined
        },
      };

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { isDark } = useTheme();

  return (
    <div className="flex h-screen dark:bg-gray-900">
      <Suspense
        fallback={
          <div className="w-[250px]">
            <FancyLoader message="Chargement des noeuds..." />
          </div>
        }
      >
        <Sidebar />
      </Suspense>
      <div className="flex flex-col flex-1">
        <Suspense
          fallback={
            <div className="h-[64px] bg-gray-100 dark:bg-gray-800">
              <FancyLoader message="Chargement du menu..." />
            </div>
          }
        >
          <Header />
        </Suspense>
        <div className="flex flex-1 relative overflow-hidden">
          <div ref={reactFlowWrapper} className="flex-1 h-full min-w-0">
            {/* ReactFlow, pas lazy ici car central et critique */}
            <ReactFlow
              nodes={nodes}
              edges={edgesWithSelection}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              defaultEdgeOptions={edgeOptions}
              className="dark:bg-gray-900 dark:text-white transition-colors duration-200"
              onEdgeClick={useCallback((evt: { preventDefault: () => void; }, edge: { id: React.SetStateAction<string | null>; }) => {
                evt.preventDefault();
                setSelectedEdge(edge.id);
              }, [setSelectedEdge])}
              onNodeClick={useCallback((evt: { preventDefault: () => void; }, node: React.SetStateAction<Node | null>) => {
                evt.preventDefault();
                setSelectedNode(node);
              }, [setSelectedNode])}
              onPaneClick={useCallback((evt: { preventDefault: () => void; }) => {
                evt.preventDefault();
                setSelectedNode(null);
                setSelectedEdge(null);
              }, [setSelectedNode, setSelectedEdge])}
              fitView
            >
              <Background
                color={isDark ? "#374151" : "#e5e7eb"}
                gap={16}
                size={1}
                className="dark:bg-gray-900"
              />
              <Controls className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700" />
            </ReactFlow>
          </div>

          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ x: 280, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 280, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l dark:border-gray-800 bg-white dark:bg-gray-900 h-full overflow-y-auto"
              >
                <Suspense
                  fallback={
                    <div className="p-4">Chargement des propriétés...</div>
                  }
                >
                  <PropertiesPanel
                    selectedNode={selectedNode}
                    onNodeUpdate={updateNodeData}
                  />

                </Suspense>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );  
}

export default Flow;