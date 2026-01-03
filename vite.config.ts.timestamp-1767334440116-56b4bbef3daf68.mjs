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
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@lessonbuilder": path.resolve(__vite_injected_original_dirname, "./src/lessonbuilder")
    }
  },
  define: {
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://testbackend-hcoy.onrender.com")
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxyYWh1bFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXE9maWZjZSBXb3JrXFxcXEF0aGVuYSBGcm9udGVuZFxcXFxDcmVkaXRvcl9Vc2VyRGFzaFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxccmFodWxcXFxcT25lRHJpdmVcXFxcRGVza3RvcFxcXFxPZmlmY2UgV29ya1xcXFxBdGhlbmEgRnJvbnRlbmRcXFxcQ3JlZGl0b3JfVXNlckRhc2hcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL3JhaHVsL09uZURyaXZlL0Rlc2t0b3AvT2ZpZmNlJTIwV29yay9BdGhlbmElMjBGcm9udGVuZC9DcmVkaXRvcl9Vc2VyRGFzaC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBwcm94eToge1xyXG4gICAgICAnL2FwaSc6IHtcclxuICAgICAgICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjkwMDAnLFxyXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXHJcbiAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICBwcm94eS5vbignZXJyb3InLCAoZXJyLCBfcmVxLCBfcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwcm94eSBlcnJvcicsIGVycik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCBfcmVzKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVzJywgKHByb3h5UmVzLCByZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1JlY2VpdmVkIFJlc3BvbnNlIGZyb20gdGhlIFRhcmdldDonLCBwcm94eVJlcy5zdGF0dXNDb2RlLCByZXEudXJsKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIGNvcnM6IHtcclxuICAgICAgb3JpZ2luOiBbJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsICdodHRwOi8vbG9jYWxob3N0OjkwMDAnXSxcclxuICAgICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ1BBVENIJywgJ09QVElPTlMnXSxcclxuICAgICAgYWxsb3dlZEhlYWRlcnM6IFsnQ29udGVudC1UeXBlJywgJ0F1dGhvcml6YXRpb24nLCAnWC1SZXF1ZXN0ZWQtV2l0aCcsICdBY2NlcHQnXSxcclxuICAgICAgY3JlZGVudGlhbHM6IHRydWUsXHJcbiAgICAgIG1heEFnZTogMzYwMFxyXG4gICAgfSxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICBobXI6IHtcclxuICAgICAgcG9ydDogMzAwMCxcclxuICAgICAgcHJvdG9jb2w6ICd3cycsXHJcbiAgICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxyXG4gICAgICBjbGllbnRQb3J0OiAzMDAwXHJcbiAgICB9XHJcbiAgfSxcclxuICBwcmV2aWV3OiB7XHJcbiAgICBob3N0OiBcIjAuMC4wLjBcIixcclxuICAgIHBvcnQ6IDMwMDAsXHJcbiAgICBhbGxvd2VkSG9zdHM6IFtcclxuICAgICAgXCJ3d3cubG1zYXRoZW5hLmNvbVwiLFxyXG4gICAgICBcImxtc2F0aGVuYS5jb21cIixcclxuICAgICAgXCJhcGkubG1zYXRoZW5hLmNvbVwiLFxyXG4gICAgICBcIjU0LjE5OC42OS4zMlwiLFxyXG4gICAgICBcImh0dHBzOi8vY3JlZGl0b3Iub25yZW5kZXIuY29tXCIsXHJcbiAgICAgIFwiaHR0cHM6Ly9jcmVkaXRvci1mcm9udGVuZC1wNmx0Lm9ucmVuZGVyLmNvbVwiXHJcbiAgICBdLFxyXG4gICAgY29yczogdHJ1ZVxyXG4gIH0sXHJcbiAgYmFzZTogJy8nLFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSAnZGV2ZWxvcG1lbnQnICYmXHJcbiAgICBjb21wb25lbnRUYWdnZXIoKSxcclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgICAgXCJAbGVzc29uYnVpbGRlclwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjL2xlc3NvbmJ1aWxkZXJcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgZGVmaW5lOiB7XHJcbiAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfQVBJX0JBU0VfVVJMJzogSlNPTi5zdHJpbmdpZnkoJ2h0dHBzOi8vdGVzdGJhY2tlbmQtaGNveS5vbnJlbmRlci5jb20nKSxcclxuICB9LFxyXG59KSk7XHJcblxyXG5cclxuXHJcbi8vICMoVGVzdGluZyBCYWNrZW5kKVxyXG4vLyAjIFZJVEVfQVBJX0JBU0VfVVJMPWh0dHBzOi8vdGVzdGJhY2tlbmQtaGNveS5vbnJlbmRlci5jb21cclxuXHJcbi8vICMoZGV2ZWxvcG1lbnQgQmFja2VuZClcclxuLy8gVklURV9BUElfQkFTRV9VUkw9aHR0cHM6Ly9jcmVkaXRvci5vbnJlbmRlci5jb21cclxuXHJcbi8vICMobG9jYWwgQmFja2VuZClcclxuLy8gIyBWSVRFX0FQSV9CQVNFX1VSTD0gaHR0cDovL2xvY2FsaG9zdDo5MDAwXHJcblxyXG4vLyAjKE1haW4gQmFja2VuZClcclxuLy8gIyBWSVRFX0FQSV9CQVNFX1VSTD0gaHR0cHM6Ly9jcmVkaXRvci1iYWNrZW5kLWxmcmUub25yZW5kZXIuY29tXHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNmEsU0FBUyxvQkFBb0I7QUFDMWMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQzVDLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFNBQVM7QUFDckMsb0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxVQUNoQyxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsb0JBQVEsSUFBSSxrQ0FBa0MsSUFBSSxRQUFRLElBQUksR0FBRztBQUFBLFVBQ25FLENBQUM7QUFDRCxnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUM1QyxvQkFBUSxJQUFJLHNDQUFzQyxTQUFTLFlBQVksSUFBSSxHQUFHO0FBQUEsVUFDaEYsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osUUFBUSxDQUFDLHlCQUF5Qix1QkFBdUI7QUFBQSxNQUN6RCxTQUFTLENBQUMsT0FBTyxRQUFRLE9BQU8sVUFBVSxTQUFTLFNBQVM7QUFBQSxNQUM1RCxnQkFBZ0IsQ0FBQyxnQkFBZ0IsaUJBQWlCLG9CQUFvQixRQUFRO0FBQUEsTUFDOUUsYUFBYTtBQUFBLE1BQ2IsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFlBQVk7QUFBQSxJQUNaLEtBQUs7QUFBQSxNQUNILE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxJQUNBLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxNQUFNO0FBQUEsRUFDTixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLGtCQUFrQixLQUFLLFFBQVEsa0NBQVcscUJBQXFCO0FBQUEsSUFDakU7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixxQ0FBcUMsS0FBSyxVQUFVLHVDQUF1QztBQUFBLEVBQzdGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFsicGF0aCJdCn0K
