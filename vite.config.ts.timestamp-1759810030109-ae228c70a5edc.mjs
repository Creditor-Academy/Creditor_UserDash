// vite.config.ts
import { defineConfig } from "file:///C:/Users/cobuy/Desktop/athena-user/Creditor_UserDash/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/cobuy/Desktop/athena-user/Creditor_UserDash/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/cobuy/Desktop/athena-user/Creditor_UserDash/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\cobuy\\Desktop\\athena-user\\Creditor_UserDash";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3e3,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
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
      origin: ["http://localhost:3000", "http://localhost:5000"],
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
      "54.198.69.32"
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
    "import.meta.env.VITE_API_BASE_URL": JSON.stringify("https://test-backend-e7d4.onrender.com")
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjb2J1eVxcXFxEZXNrdG9wXFxcXGF0aGVuYS11c2VyXFxcXENyZWRpdG9yX1VzZXJEYXNoXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxjb2J1eVxcXFxEZXNrdG9wXFxcXGF0aGVuYS11c2VyXFxcXENyZWRpdG9yX1VzZXJEYXNoXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9jb2J1eS9EZXNrdG9wL2F0aGVuYS11c2VyL0NyZWRpdG9yX1VzZXJEYXNoL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogMzAwMCxcclxuICAgIHByb3h5OiB7XHJcbiAgICAgICcvYXBpJzoge1xyXG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCcsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcnKSxcclxuICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcclxuICAgICAgICAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIF9yZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3Byb3h5IGVycm9yJywgZXJyKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCByZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ1NlbmRpbmcgUmVxdWVzdCB0byB0aGUgVGFyZ2V0OicsIHJlcS5tZXRob2QsIHJlcS51cmwpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgX3JlcykgPT4ge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgUmVzcG9uc2UgZnJvbSB0aGUgVGFyZ2V0OicsIHByb3h5UmVzLnN0YXR1c0NvZGUsIHJlcS51cmwpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgY29yczoge1xyXG4gICAgICBvcmlnaW46IFsnaHR0cDovL2xvY2FsaG9zdDozMDAwJywgJ2h0dHA6Ly9sb2NhbGhvc3Q6NTAwMCddLFxyXG4gICAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnUEFUQ0gnLCAnT1BUSU9OUyddLFxyXG4gICAgICBhbGxvd2VkSGVhZGVyczogWydDb250ZW50LVR5cGUnLCAnQXV0aG9yaXphdGlvbicsICdYLVJlcXVlc3RlZC1XaXRoJywgJ0FjY2VwdCddLFxyXG4gICAgICBjcmVkZW50aWFsczogdHJ1ZSxcclxuICAgICAgbWF4QWdlOiAzNjAwXHJcbiAgICB9LFxyXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcclxuICAgIGhtcjoge1xyXG4gICAgICBwb3J0OiAzMDAwLFxyXG4gICAgICBwcm90b2NvbDogJ3dzJyxcclxuICAgICAgaG9zdDogJ2xvY2FsaG9zdCcsXHJcbiAgICAgIGNsaWVudFBvcnQ6IDMwMDBcclxuICAgIH1cclxuICB9LFxyXG4gIHByZXZpZXc6IHtcclxuICAgIGhvc3Q6IFwiMC4wLjAuMFwiLFxyXG4gICAgcG9ydDogMzAwMCxcclxuICAgIGFsbG93ZWRIb3N0czogW1xyXG4gICAgICBcInd3dy5sbXNhdGhlbmEuY29tXCIsXHJcbiAgICAgIFwibG1zYXRoZW5hLmNvbVwiLFxyXG4gICAgICBcImFwaS5sbXNhdGhlbmEuY29tXCIsXHJcbiAgICAgIFwiNTQuMTk4LjY5LjMyXCJcclxuICAgIF0sXHJcbiAgICBjb3JzOiB0cnVlXHJcbiAgfSxcclxuICBiYXNlOiAnLycsXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGRlZmluZToge1xyXG4gICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX0FQSV9CQVNFX1VSTCc6IEpTT04uc3RyaW5naWZ5KCdodHRwczovL3Rlc3QtYmFja2VuZC1lN2Q0Lm9ucmVuZGVyLmNvbScpLFxyXG4gIH0sXHJcbn0pKTtcclxuXHJcbi8vICMgVklURV9BUElfQkFTRV9VUkw9IGh0dHBzOi8vY3JlZGl0b3ItYmFja2VuZC14cGNuLm9ucmVuZGVyLmNvbVxyXG4vLyAjIFZJVEVfQVBJX0JBU0VfVVJMPSBodHRwczovL2NyZWRpdG9yLWJhY2tlbmQtMS1paWp5Lm9ucmVuZGVyLmNvbVxyXG4vLyAjIFZJVEVfQVBJX0JBU0VfVVJMPSBodHRwczovL2NyZWRpdG9yLWJhY2tlbmQtOXVwaS5vbnJlbmRlci5jb21cclxuLy8gIyBWSVRFX0FQSV9CQVNFX1VSTD0gaHR0cDovL2xvY2FsaG9zdDo5MDAwXHJcbi8vICMgVklURV9BUElfQkFTRV9VUkw9IGh0dHBzOi8vY3JlZGl0b3ItYmFja2VuZC1jZWRzLm9ucmVuZGVyLmNvbSJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFYsU0FBUyxvQkFBb0I7QUFDdlgsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxRQUNSLGNBQWM7QUFBQSxRQUNkLFFBQVE7QUFBQSxRQUNSLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQzVDLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsZ0JBQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxNQUFNLFNBQVM7QUFDckMsb0JBQVEsSUFBSSxlQUFlLEdBQUc7QUFBQSxVQUNoQyxDQUFDO0FBQ0QsZ0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxLQUFLLFNBQVM7QUFDNUMsb0JBQVEsSUFBSSxrQ0FBa0MsSUFBSSxRQUFRLElBQUksR0FBRztBQUFBLFVBQ25FLENBQUM7QUFDRCxnQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLEtBQUssU0FBUztBQUM1QyxvQkFBUSxJQUFJLHNDQUFzQyxTQUFTLFlBQVksSUFBSSxHQUFHO0FBQUEsVUFDaEYsQ0FBQztBQUFBLFFBQ0g7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsTUFBTTtBQUFBLE1BQ0osUUFBUSxDQUFDLHlCQUF5Qix1QkFBdUI7QUFBQSxNQUN6RCxTQUFTLENBQUMsT0FBTyxRQUFRLE9BQU8sVUFBVSxTQUFTLFNBQVM7QUFBQSxNQUM1RCxnQkFBZ0IsQ0FBQyxnQkFBZ0IsaUJBQWlCLG9CQUFvQixRQUFRO0FBQUEsTUFDOUUsYUFBYTtBQUFBLE1BQ2IsUUFBUTtBQUFBLElBQ1Y7QUFBQSxJQUNBLFlBQVk7QUFBQSxJQUNaLEtBQUs7QUFBQSxNQUNILE1BQU07QUFBQSxNQUNOLFVBQVU7QUFBQSxNQUNWLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxJQUNkO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sY0FBYztBQUFBLE1BQ1o7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsSUFDQSxNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLHFDQUFxQyxLQUFLLFVBQVUsd0NBQXdDO0FBQUEsRUFDOUY7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
