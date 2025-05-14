import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8001,
    proxy: {
      // Proxy API requests to bypass CORS during development
      '/api': {
        target: mode === 'development' ? 'http://localhost:3001' : 'https://api.evrlink.com',
        changeOrigin: true,
        secure: false, // Set to false for local development
        rewrite: (path) => path
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      include: ["buffer", "crypto", "stream", "util"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          web3auth: ["@web3auth/modal", "@web3auth/base"],
        },
      },
    },
  },
  define: {
    // Make environment variables available in the code
    'import.meta.env.VITE_USE_PROXY': JSON.stringify(process.env.VITE_USE_PROXY || 'true'),
  },
}));
