// vite.config.ts
import { defineConfig } from "file:///C:/Users/rahul/OneDrive/Desktop/Ofifce%20Work/Athena%20Frontend/Creditor_UserDash/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/rahul/OneDrive/Desktop/Ofifce%20Work/Athena%20Frontend/Creditor_UserDash/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/rahul/OneDrive/Desktop/Ofifce%20Work/Athena%20Frontend/Creditor_UserDash/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\rahul\\OneDrive\\Desktop\\Ofifce Work\\Athena Frontend\\Creditor_UserDash";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:9000",
        changeOrigin: true,
        secure: false,
        rewrite: (path2) => path2.replace(/^\/api/, ""),
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
          });
        }
      }
    },
    cors: {
      origin: ["http://localhost:3000", "http://localhost:9000"],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
      credentials: true,
      maxAge: 3600
    },
    strictPort: true,
    hmr: {
      port: 3e3,
      protocol: "ws",
      host: "localhost",
      clientPort: 3e3
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 3e3,
    allowedHosts: [
      "www.lmsathena.com",
      "lmsathena.com",
      "api.lmsathena.com",
      "54.198.69.32",
      "https://creditor.onrender.com",
      "https://creditor-frontend-p6lt.onrender.com"
    ],
    cors: true
  },
  base: "/",
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("http://localhost:9000")
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyYWh1bFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXE9maWZjZSBXb3JrXFxcXEF0aGVuYSBGcm9udGVuZFxcXFxDcmVkaXRvcl9Vc2VyRGFzaFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmFodWxcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxPZmlmY2UgV29ya1xcXFxBdGhlbmEgRnJvbnRlbmRcXFxcQ3JlZGl0b3JfVXNlckRhc2hcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3JhaHVsL09uZURyaXZlL0Rlc2t0b3AvT2ZpZmNlJTIwV29yay9BdGhlbmElMjBGcm9udGVuZC9DcmVkaXRvcl9Vc2VyRGFzaC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjkwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcm94eSBlcnJvcicsIGVycik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvcnM6IHtcclxuICAgICAgb3JpZ2luOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsICdodHRwOi8vbG9jYWxob3N0OjkwMDAnXSxcclxuICAgICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ1BBVENIJywgJ09QVElPTlMnXSxcclxuICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nLCAnWC1SZXF1ZXN0ZWQtV2l0aCcsICdBY2NlcHQnXSxcclxuICAgICAgY3JlZGVudGlhbHM6IHRydWUsXHJcbiAgICAgIG1heEFnZTogMzYwMFxyXG4gICAgfSxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICBobXI6IHtcclxuICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgcHJvdG9jb2w6ICd3cycsXHJcbiAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxyXG4gICAgICBjbGllbnRQb3J0OiAzMDAwXHJcbiAgICB9XHJcbiAgfSxcclxuICBwcmV2aWV3OiB7XHJcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBhbGxvd2VkSG9zdHM6IFtcclxuICAgICAgXCJ3d3cubG1zYXRoZW5hLmNvbVwiLFxyXG4gICAgICBcImxtc2F0aGVuYS5jb21cIixcclxuICAgICAgXCJhcGkubG1zYXRoZW5hLmNvbVwiLFxyXG4gICAgICBcIjU0LjE5OC42OS4zMlwiLFxyXG4gICAgICBcImh0dHBzOi8vY3JlZGl0b3Iub25yZW5kZXIuY29tXCIsXHJcbiAgICAgIFwiaHR0cHM6Ly9jcmVkaXRvci1mcm9udGVuZC1wNmx0Lm9ucmVuZGVyLmNvbVwiXHJcbiAgICBdLFxyXG4gICAgY29yczogdHJ1ZVxyXG4gIH0sXHJcbiAgYmFzZTogJy8nLFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBkZWZpbmU6IHtcclxuICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9BUElfQkFTRV9VUkwnOiBKU09OLnN0cmluZ2lmeSgnaHR0cDovL2xvY2FsaG9zdDo5MDAwJyksXHJcbiAgfSxcclxufSkpO1xyXG5cclxuXHJcblxyXG4vLyAjKFRlc3RpbmcgQmFja2VuZClcclxuLy8gIyBWSVRFX0FQSV9CQVNFX1VSTD1odHRwczovL3Rlc3RiYWNrZW5kLWhjb3kub25yZW5kZXIuY29tXHJcblxyXG4vLyAjKGRldmVsb3BtZW50IEJhY2tlbmQpXHJcbi8vIFZJVEVfQVBJX0JBU0VfVVJMPWh0dHBzOi8vY3JlZGl0b3Iub25yZW5kZXIuY29tXHJcblxyXG4vLyAjKGxvY2FsIEJhY2tlbmQpXHJcbi8vICMgVklURV9BUElfQkFTRV9VUkw9IGh0dHA6Ly9sb2NhbGhvc3Q6OTAwMFxyXG5cclxuLy8gIyhNYWluIEJhY2tlbmQpXHJcbi8vICMgVklURV9BUElfQkFTRV9VUkw9IGh0dHBzOi8vY3JlZGl0b3ItYmFja2VuZC1sZnJlLm9ucmVuZGVyLmNvbVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZhLFNBQVMsb0JBQW9CO0FBQzFjLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxRQUFRO0FBQUEsUUFDUixTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxVQUFVLEVBQUU7QUFBQSxRQUM1QyxXQUFXLENBQUMsT0FBTyxhQUFhO0FBQzlCLGdCQUFNLEdBQUcsU0FBUyxDQUFDLEtBQUssTUFBTSxTQUFTO0FBQ3JDLG9CQUFRLElBQUksZUFBZSxHQUFHO0FBQUEsVUFDaEMsQ0FBQztBQUNELGdCQUFNLEdBQUcsWUFBWSxDQUFDLFVBQVUsS0FBSyxTQUFTO0FBQzVDLG9CQUFRLElBQUksa0NBQWtDLElBQUksUUFBUSxJQUFJLEdBQUc7QUFBQSxVQUNuRSxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsb0JBQVEsSUFBSSxzQ0FBc0MsU0FBUyxZQUFZLElBQUksR0FBRztBQUFBLFVBQ2hGLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxNQUNKLFFBQVEsQ0FBQyx5QkFBeUIsdUJBQXVCO0FBQUEsTUFDekQsU0FBUyxDQUFDLE9BQU8sUUFBUSxPQUFPLFVBQVUsU0FBUyxTQUFTO0FBQUEsTUFDNUQsZ0JBQWdCLENBQUMsZ0JBQWdCLGlCQUFpQixvQkFBb0IsUUFBUTtBQUFBLE1BQzlFLGFBQWE7QUFBQSxNQUNiLFFBQVE7QUFBQSxJQUNWO0FBQUEsSUFDQSxZQUFZO0FBQUEsSUFDWixLQUFLO0FBQUEsTUFDSCxNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsSUFDZDtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLGNBQWM7QUFBQSxNQUNaO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLHFDQUFxQyxLQUFLLFVBQVUsdUJBQXVCO0FBQUEsRUFDN0U7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
