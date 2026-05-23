import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const isDocker = process.env.DOCKER === 'true' || process.env.CHOKIDAR_USEPOLLING === 'true'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined
          }

          if (id.includes('framer-motion')) {
            return 'motion'
          }

          if (id.includes('react-icons')) {
            return 'icons'
          }

          if (id.includes('axios')) {
            return 'network'
          }

          if (
            id.includes('react-router-dom') ||
            id.includes('react-helmet-async') ||
            id.includes('react-hot-toast') ||
            id.includes(`${process.platform === 'win32' ? '\\' : '/'}react${process.platform === 'win32' ? '\\' : '/'}`) ||
            id.includes('react-dom')
          ) {
            return 'react-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    watch: isDocker
      ? {
          usePolling: true,
          interval: 150,
        }
      : undefined,
  },
})
