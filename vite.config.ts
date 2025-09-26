import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    },
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:9000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
      credentials: true,
      maxAge: 3600
    },
    strictPort: true,
    hmr: {
      port: 3000,
      protocol: 'ws',
      host: 'localhost',
      clientPort: 3000
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [
      "www.lmsathena.com",
      "lmsathena.com",
      "api.lmsathena.com",
      "54.198.69.32"
    ],
    cors: true
  },
  base: '/',
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://creditor.onrender.com'),
  },
}));



// #(Testing Backend)
// # VITE_API_BASE_URL=https://test-backend-yf36.onrender.com

// #(development Backend)
// VITE_API_BASE_URL=https://creditor-backend-1-iijy.onrender.com

// #(local Backend)
// # VITE_API_BASE_URL= http://localhost:9000

// #(Main Backend)
// # VITE_API_BASE_URL= https://creditor-backend-9upi.onrender.com
