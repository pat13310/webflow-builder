import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [react(), viteCommonjs(), nodePolyfills()],
  build: {
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: true,
      requireReturnsDefault: true
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react', 'pg', 'mysql2', 'mongodb', 'redis', 'sqlite3', 'fs/promises']
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      // Remplacer les modules natifs par des stubs vides
      'pg': './src/empty-module.ts',
      'mysql2': './src/empty-module.ts',
      'mongodb': './src/empty-module.ts',
      'redis': './src/empty-module.ts',
      'sqlite3': './src/empty-module.ts',
      'fs/promises': './src/empty-module.ts'
    }
  },

  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  }
});