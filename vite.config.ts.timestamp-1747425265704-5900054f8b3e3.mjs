// vite.config.ts
import { defineConfig } from "file:///C:/Users/PAWAN%20KUMAR/Desktop/base/evrlink-base-batch/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/PAWAN%20KUMAR/Desktop/base/evrlink-base-batch/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/PAWAN%20KUMAR/Desktop/base/evrlink-base-batch/node_modules/lovable-tagger/dist/index.js";
import { nodePolyfills } from "file:///C:/Users/PAWAN%20KUMAR/Desktop/base/evrlink-base-batch/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\PAWAN KUMAR\\Desktop\\base\\evrlink-base-batch";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8001,
    proxy: {
      // Proxy API requests to bypass CORS during development
      "/api": {
        target: mode === "development" ? "http://localhost:3001" : "https://api.evrlink.com",
        changeOrigin: true,
        secure: false,
        // Set to false for local development
        rewrite: (path2) => path2
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
        process: true
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          web3auth: ["@web3auth/modal", "@web3auth/base"]
        }
      }
    }
  },
  define: {
    // Make environment variables available in the code
    "import.meta.env.VITE_USE_PROXY": JSON.stringify(process.env.VITE_USE_PROXY || "true")
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQQVdBTiBLVU1BUlxcXFxEZXNrdG9wXFxcXGJhc2VcXFxcZXZybGluay1iYXNlLWJhdGNoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQQVdBTiBLVU1BUlxcXFxEZXNrdG9wXFxcXGJhc2VcXFxcZXZybGluay1iYXNlLWJhdGNoXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9QQVdBTiUyMEtVTUFSL0Rlc2t0b3AvYmFzZS9ldnJsaW5rLWJhc2UtYmF0Y2gvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IHsgbm9kZVBvbHlmaWxscyB9IGZyb20gXCJ2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwMDEsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAvLyBQcm94eSBBUEkgcmVxdWVzdHMgdG8gYnlwYXNzIENPUlMgZHVyaW5nIGRldmVsb3BtZW50XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogbW9kZSA9PT0gJ2RldmVsb3BtZW50JyA/ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnIDogJ2h0dHBzOi8vYXBpLmV2cmxpbmsuY29tJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgc2VjdXJlOiBmYWxzZSwgLy8gU2V0IHRvIGZhbHNlIGZvciBsb2NhbCBkZXZlbG9wbWVudFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICBub2RlUG9seWZpbGxzKHtcclxuICAgICAgaW5jbHVkZTogW1wiYnVmZmVyXCIsIFwiY3J5cHRvXCIsIFwic3RyZWFtXCIsIFwidXRpbFwiXSxcclxuICAgICAgZ2xvYmFsczoge1xyXG4gICAgICAgIEJ1ZmZlcjogdHJ1ZSxcclxuICAgICAgICBnbG9iYWw6IHRydWUsXHJcbiAgICAgICAgcHJvY2VzczogdHJ1ZSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgd2ViM2F1dGg6IFtcIkB3ZWIzYXV0aC9tb2RhbFwiLCBcIkB3ZWIzYXV0aC9iYXNlXCJdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgZGVmaW5lOiB7XHJcbiAgICAvLyBNYWtlIGVudmlyb25tZW50IHZhcmlhYmxlcyBhdmFpbGFibGUgaW4gdGhlIGNvZGVcclxuICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9VU0VfUFJPWFknOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5WSVRFX1VTRV9QUk9YWSB8fCAndHJ1ZScpLFxyXG4gIH0sXHJcbn0pKTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0VixTQUFTLG9CQUFvQjtBQUN6WCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMscUJBQXFCO0FBSjlCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBO0FBQUEsTUFFTCxRQUFRO0FBQUEsUUFDTixRQUFRLFNBQVMsZ0JBQWdCLDBCQUEwQjtBQUFBLFFBQzNELGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQTtBQUFBLFFBQ1IsU0FBUyxDQUFDQSxVQUFTQTtBQUFBLE1BQ3JCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLElBQzFDLGNBQWM7QUFBQSxNQUNaLFNBQVMsQ0FBQyxVQUFVLFVBQVUsVUFBVSxNQUFNO0FBQUEsTUFDOUMsU0FBUztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ1g7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osVUFBVSxDQUFDLG1CQUFtQixnQkFBZ0I7QUFBQSxRQUNoRDtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBO0FBQUEsSUFFTixrQ0FBa0MsS0FBSyxVQUFVLFFBQVEsSUFBSSxrQkFBa0IsTUFBTTtBQUFBLEVBQ3ZGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
