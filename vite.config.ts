import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Tiny dev-only middleware so we don't need a second server process.
function devApiPlugin(): Plugin {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use("/api/health", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ ok: true, at: Date.now() }));
      });
      // Add lightweight test endpoints here if needed.
    },
  };
}

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: true, // ✅ required for *.replit.dev preview hosts
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    devApiPlugin(), // ✅ keeps everything in one process
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));