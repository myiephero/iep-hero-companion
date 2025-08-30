import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Simple API plugin that proxies to Express server
function devApiPlugin(): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use("/api/health", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, at: Date.now() }));
      });

      server.middlewares.use("/api", async (req, res) => {
        try {
          const url = `http://localhost:3001${req.url}`;
          const response = await fetch(url, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' }
          });

          const data = await response.text();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = response.status;
          res.end(data);
        } catch (error) {
          console.error('Proxy error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Connection failed' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    devApiPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));