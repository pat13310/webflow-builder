import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReactFlowProvider } from 'reactflow';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </React.StrictMode>
  );
}