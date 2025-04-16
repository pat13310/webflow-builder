import React, { useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Trash, Play, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import useWorkflowStore from '../store/workflowStore';

interface NodeWrapperProps {
  children: React.ReactNode;
  nodeId: string;
  isExecuting?: boolean;
  status?: 'idle' | 'running' | 'success' | 'error' | 'warning' | 'validated';
}

const statusColors = {
  idle: 'bg-gray-100 dark:bg-gray-800',
  running: 'bg-blue-50 dark:bg-blue-900/20',
  success: 'bg-green-50 dark:bg-green-900/20',
  error: 'bg-red-50 dark:bg-red-900/20',
  warning: 'bg-yellow-50 dark:bg-yellow-900/20',
  validated: 'bg-yellow-50 dark:bg-yellow-900/20',
};

const statusRings = {
  idle: '',
  running: 'ring-2 ring-blue-500/50',
  success: 'ring-2 ring-green-500/50',
  error: 'ring-2 ring-red-500/50',
  warning: 'ring-2 ring-yellow-500/50',
  validated: 'ring-2 ring-yellow-500/50',
};

const statusIcons = {
  idle: null,
  running: <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />,
  success: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  error: <XCircle className="h-3 w-3 text-red-500" />,
  warning: <AlertCircle className="h-3 w-3 text-yellow-500" />,
  validated: <CheckCircle2 className="h-3 w-3 text-yellow-500" />,
};

export const NodeWrapper = ({ children, nodeId, isExecuting, status = 'idle' }: NodeWrapperProps) => {
  const { duplicateNode, deleteNode, executeNode } = useWorkflowStore();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <motion.div
          initial={false}
          variants={{
            executing: {
              scale: [1, 1.02, 1],
              transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse"
              }
            },
            idle: {
              scale: 1
            }
          }}
          animate={isExecuting ? "executing" : "idle"}
          className={`relative ${statusColors[status]} ${statusRings[status]} rounded-md transition-all duration-200`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          tabIndex={0}
        >
          {/* Status indicator */}
          <AnimatePresence>
            {status !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-1 -right-1 z-10"
              >
                {statusIcons[status as keyof typeof statusIcons]}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Focus ring */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-[1px] rounded-md pointer-events-none ring-1 ring-emerald-500/20 dark:ring-emerald-400/30"
              />
            )}
          </AnimatePresence>

          {/* Node content */}
          <motion.div
            className="relative"
          >
            {children}
          </motion.div>
        </motion.div>
      </ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
            className="min-w-[140px] bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <ContextMenu.Item
              className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => duplicateNode(nodeId)}
            >
              <Copy className="w-3 h-3 mr-1.5" />
              Dupliquer
            </ContextMenu.Item>
            
            <ContextMenu.Item
              className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => executeNode(nodeId)}
            >
              <Play className="w-3 h-3 mr-1.5" />
              Exécuter
            </ContextMenu.Item>

            <ContextMenu.Separator className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            
            <ContextMenu.Item
              className="flex items-center px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
              onClick={() => deleteNode(nodeId)}
            >
              <Trash className="w-3 h-3 mr-1.5" />
              Supprimer
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};