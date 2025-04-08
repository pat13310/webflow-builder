import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, Clock, Globe, Database, Mail, GitBranch, Timer, Bot, Split, Bug, ChevronDown, MousePointer, Hash, FileText } from 'lucide-react';

interface NodeCategoryProps {
  title: string;
  children: React.ReactNode;
  index: number;
  defaultExpanded?: boolean;
}

const NodeCategory = ({ title, children, index, defaultExpanded = true }: NodeCategoryProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <motion.div 
      className="mb-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * index }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md group transition-colors"
      >
        <h3 className="text-2xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider group-hover:text-gray-900 dark:group-hover:text-gray-300">
          {title}
        </h3>
        <ChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
        />
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 mt-1 px-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NodeItem = ({ icon: Icon, label, type, color }: { icon: any; label: string; type: string; color: string }) => {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md cursor-move hover:translate-x-1 transition-transform flex items-center text-sm group hover:bg-gray-100 dark:hover:bg-gray-700/50"
      draggable
      onDragStart={onDragStart}
    >
      <div className={`w-6 h-6 rounded-md ${color} flex items-center justify-center mr-2 group-hover:scale-110 transition-transform`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-gray-900 dark:text-gray-100 text-xs">{label}</span>
    </div>
  );
};

const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
      <motion.div 
        className="p-3 border-b border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
            placeholder="Search nodes..."
            className="w-full px-3 py-1.5 pl-8 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-gray-300"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2 top-2" />
        </div>
      </motion.div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        <NodeCategory title="Triggers" index={0}>
          <NodeItem
            icon={MousePointer}
            label="Push Button"
            type="pushButton"
            color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900 dark:text-cyan-300"
          />
          <NodeItem
            icon={Zap}
            label="Webhook"
            type="webhook"
            color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300"
          />
          <NodeItem
            icon={Clock}
            label="Schedule"
            type="schedule"
            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"
          />
        </NodeCategory>
        
        <NodeCategory title="Actions" index={1}>
          <NodeItem
            icon={Globe}
            label="HTTP Request"
            type="httpRequest"
            color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
          />
          <NodeItem
            icon={Database}
            label="Database"
            type="database"
            color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
          />
          <NodeItem
            icon={Mail}
            label="Email"
            type="email"
            color="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
          />
          <NodeItem
            icon={Hash}
            label="Counter"
            type="counter"
            color="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300"
          />
        </NodeCategory>
        
        <NodeCategory title="Logic" index={2}>
          <NodeItem
            icon={GitBranch}
            label="If Condition"
            type="ifCondition"
            color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300"
          />
          <NodeItem
            icon={Timer}
            label="Wait"
            type="wait"
            color="bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300"
          />
          <NodeItem
            icon={Split}
            label="Split Output"
            type="split"
            color="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300"
          />
        </NodeCategory>

        <NodeCategory title="AI" index={3}>
          <NodeItem
            icon={Bot}
            label="AI Agent"
            type="aiAgent"
            color="bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-300"
          />
        </NodeCategory>

        <NodeCategory title="Debug" index={4}>
          <NodeItem
            icon={Bug}
            label="Debug"
            type="debug"
            color="bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-300"
          />
        </NodeCategory>

        <NodeCategory title="Output" index={5}>
          <NodeItem
            icon={FileText}
            label="Output"
            type="output"
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300"
          />
        </NodeCategory>
      </div>
    </aside>
  );
};

export default Sidebar;