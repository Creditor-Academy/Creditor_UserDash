import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
  },
  preview: {
    host: "0.0.0.0",   // Allow external access
    port: 3000,
    allowedHosts: [
      "www.lmsathena.com",
      "lmsathena.com",
      "api.lmsathena.com",
      "54.198.69.32"
    ]
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
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('https://sharebackend-sdkp.onrender.com'),
  },
}));