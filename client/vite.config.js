import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { imagetools } from 'vite-imagetools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    imagetools({
      defaultDirectives: new URLSearchParams([
        ['format', 'webp;avif;original'],
        ['quality', '80'],
        ['progressive', 'true'],
      ])
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // your backend
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-avatar', '@radix-ui/react-dialog', '@radix-ui/react-toast'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
});
