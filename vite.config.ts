import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'terser',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for core libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          // Query and state management
          query: ['@tanstack/react-query'],
          // Large utility libraries
          utils: ['date-fns', 'lucide-react', 'clsx', 'tailwind-merge'],
          // Forms and validation
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
        // Optimize chunk sizes for mobile
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
      },
    },
    // Optimize for mobile networks
    chunkSizeWarningLimit: 500,
  },
  // Enhanced mobile optimization
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react'
    ],
    exclude: ['pdf-parse'] // Exclude heavy server-side only deps
  },
}));