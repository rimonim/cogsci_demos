// Example vite.config.js with manual chunk splitting

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-slot'],
          'chart-vendor': ['recharts', 'd3-scale', 'd3-shape'],
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge'],
        }
      }
    },
    // Increase the warning limit if needed
    chunkSizeWarningLimit: 1000
  }
})
