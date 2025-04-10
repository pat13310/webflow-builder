import React from 'react';

interface FancyLoaderProps {
  message?: string;
}

const FancyLoader: React.FC<FancyLoaderProps> = ({ message = 'Chargement en cours...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 text-gray-600 dark:text-gray-300 text-sm">
      <svg
        className="animate-spin h-8 w-8 text-blue-500 mb-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span>{message}</span>
    </div>
  );
};

export default FancyLoader;
