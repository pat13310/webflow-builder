import React, { useCallback, useRef, useState, lazy, Suspense } from 'react';
import { NodeChange, EdgeChange } from 'reactflow';
import ReactFlow, {
  Background,
  Controls,
  Connection,
  useReactFlow,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
} from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import 'reactflow/dist/style.css';

// Lazy load components
const Header = lazy(() => import('./components/Header.tsx'));
const Sidebar = lazy(() => import('./components/Sidebar.tsx'));
const PropertiesPanel = lazy(() => import('./components/PropertiesPanel.tsx'));


import { nodeTypes } from './components/NodeTypes.tsx';
import useWorkflowStore from './store/workflowStore.ts';
import { useTheme } from './hooks/useTheme.ts';
import FancyLoader from './components/FancyLoader.tsx';

const edgeOptions = {
  style: { stroke: '#94a3b8', strokeWidth: 1 },
  type: 'smoothstep',
  animated: false,
};

function Flow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const { nodes, edges, setNodes, setEdges, addNode, addEdge, updateNodeData, incrementNodeExecutionCounter } = useWorkflowStore();

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        const edge: Edge = {
          id: `edge-${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          type: 'smoothstep',
          sourceHandle: params.sourceHandle || undefined,
          targetHandle: params.targetHandle || undefined
        };
        setEdges((eds) => [...eds, edge]);
      }
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const position = screenToFlowPosition({
        x: event.clientX - reactFlowWrapper.current.getBoundingClientRect().left,
        y: event.clientY - reactFlowWrapper.current.getBoundingClientRect().top,
      });

      // Récupérer le compteur actuel
      const currentCounter = useWorkflowStore.getState().nodeExecutionCounters.get(type) || 0;
      const newNodeId = currentCounter + 1;
      
      // Mettre à jour le compteur
      incrementNodeExecutionCounter(type);
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
    [screenToFlowPosition, addNode, incrementNodeExecutionCounter]
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
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={edgeOptions}
              onNodeClick={(_, node) => setSelectedNode(node)}
              onPaneClick={() => setSelectedNode(null)}
              fitView
            >
              <Background
                color={isDark ? "#1f2937" : "#e5e7eb"}
                gap={16}
                size={1}
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