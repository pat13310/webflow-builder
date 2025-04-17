// vite.config.ts
import { defineConfig } from "file:///E:/ReactProjects/webflow-builder/node_modules/vite/dist/node/index.js";
import react from "file:///E:/ReactProjects/webflow-builder/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { viteCommonjs } from "file:///E:/ReactProjects/webflow-builder/node_modules/@originjs/vite-plugin-commonjs/lib/index.js";
import { nodePolyfills } from "file:///E:/ReactProjects/webflow-builder/node_modules/vite-plugin-node-polyfills/dist/index.js";
var vite_config_default = defineConfig({
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
    exclude: ["lucide-react", "pg", "mysql2", "mongodb", "redis", "sqlite3", "fs/promises"]
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      // Remplacer les modules natifs par des stubs vides
      "pg": "./src/empty-module.ts",
      "mysql2": "./src/empty-module.ts",
      "mongodb": "./src/empty-module.ts",
      "redis": "./src/empty-module.ts",
      "sqlite3": "./src/empty-module.ts",
      "fs/promises": "./src/empty-module.ts"
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
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxSZWFjdFByb2plY3RzXFxcXHdlYmZsb3ctYnVpbGRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcUmVhY3RQcm9qZWN0c1xcXFx3ZWJmbG93LWJ1aWxkZXJcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1JlYWN0UHJvamVjdHMvd2ViZmxvdy1idWlsZGVyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgdml0ZUNvbW1vbmpzIH0gZnJvbSAnQG9yaWdpbmpzL3ZpdGUtcGx1Z2luLWNvbW1vbmpzJztcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tICd2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCB2aXRlQ29tbW9uanMoKSwgbm9kZVBvbHlmaWxscygpXSxcbiAgYnVpbGQ6IHtcbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgY29tbW9uanNPcHRpb25zOiB7XG4gICAgICBpbmNsdWRlOiBbL25vZGVfbW9kdWxlcy9dLFxuICAgICAgdHJhbnNmb3JtTWl4ZWRFc01vZHVsZXM6IHRydWUsXG4gICAgICBkZWZhdWx0SXNNb2R1bGVFeHBvcnRzOiB0cnVlLFxuICAgICAgcmVxdWlyZVJldHVybnNEZWZhdWx0OiB0cnVlXG4gICAgfVxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCcsICdwZycsICdteXNxbDInLCAnbW9uZ29kYicsICdyZWRpcycsICdzcWxpdGUzJywgJ2ZzL3Byb21pc2VzJ11cbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGV4dGVuc2lvbnM6IFsnLmpzJywgJy5qc3gnLCAnLnRzJywgJy50c3gnXSxcbiAgICBhbGlhczoge1xuICAgICAgLy8gUmVtcGxhY2VyIGxlcyBtb2R1bGVzIG5hdGlmcyBwYXIgZGVzIHN0dWJzIHZpZGVzXG4gICAgICAncGcnOiAnLi9zcmMvZW1wdHktbW9kdWxlLnRzJyxcbiAgICAgICdteXNxbDInOiAnLi9zcmMvZW1wdHktbW9kdWxlLnRzJyxcbiAgICAgICdtb25nb2RiJzogJy4vc3JjL2VtcHR5LW1vZHVsZS50cycsXG4gICAgICAncmVkaXMnOiAnLi9zcmMvZW1wdHktbW9kdWxlLnRzJyxcbiAgICAgICdzcWxpdGUzJzogJy4vc3JjL2VtcHR5LW1vZHVsZS50cycsXG4gICAgICAnZnMvcHJvbWlzZXMnOiAnLi9zcmMvZW1wdHktbW9kdWxlLnRzJ1xuICAgIH1cbiAgfSxcblxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA1MTczLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgd2F0Y2g6IHtcbiAgICAgIHVzZVBvbGxpbmc6IHRydWVcbiAgICB9XG4gIH1cbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1IsU0FBUyxvQkFBb0I7QUFDclQsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsb0JBQW9CO0FBQzdCLFNBQVMscUJBQXFCO0FBRTlCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsYUFBYSxHQUFHLGNBQWMsQ0FBQztBQUFBLEVBQ2xELE9BQU87QUFBQSxJQUNMLFdBQVc7QUFBQSxJQUNYLGlCQUFpQjtBQUFBLE1BQ2YsU0FBUyxDQUFDLGNBQWM7QUFBQSxNQUN4Qix5QkFBeUI7QUFBQSxNQUN6Qix3QkFBd0I7QUFBQSxNQUN4Qix1QkFBdUI7QUFBQSxJQUN6QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxnQkFBZ0IsTUFBTSxVQUFVLFdBQVcsU0FBUyxXQUFXLGFBQWE7QUFBQSxFQUN4RjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsWUFBWSxDQUFDLE9BQU8sUUFBUSxPQUFPLE1BQU07QUFBQSxJQUN6QyxPQUFPO0FBQUE7QUFBQSxNQUVMLE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLFdBQVc7QUFBQSxNQUNYLFNBQVM7QUFBQSxNQUNULFdBQVc7QUFBQSxNQUNYLGVBQWU7QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLE9BQU87QUFBQSxNQUNMLFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
