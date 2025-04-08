import React from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface LoadingScreenProps {
  onLoadComplete?: () => void;
}

const LoadingScreen = ({ onLoadComplete }: LoadingScreenProps) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onLoadComplete?.();
    }, 2000); // Keep loading time consistent at 2 seconds

    return () => clearTimeout(timer);
  }, [onLoadComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="relative mb-6"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Play className="w-8 h-8 text-blue-500" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-blue-500/30"
            initial={{ scale: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        </motion.div>

        <motion.div
          className="space-y-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Workflow Builder
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preparing your workspace...
          </p>
        </motion.div>

        <motion.div
          className="mt-8 w-48 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;