import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// API plugin with proxy to Express server
function devApiPlugin(): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      // Health check
      server.middlewares.use("/api/health", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, at: Date.now() }));
      });

      // Proxy all other /api requests to Express server
      server.middlewares.use("/api", async (req, res, next) => {
        try {
          const targetUrl = `http://localhost:3001${req.url}`;
          const response = await fetch(targetUrl, {
            method: req.method,
            headers: req.headers as any,
            body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
          });

          res.statusCode = response.status;
          response.headers.forEach((value, key) => {
            res.setHeader(key, value);
          });

          const data = await response.text();
          res.end(data);
        } catch (error) {
          console.error('Proxy error:', error);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Proxy failed' }));
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
}));›