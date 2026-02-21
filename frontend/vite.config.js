import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const isDocker = process.env.DOCKER === 'true' || process.env.CHOKIDAR_USEPOLLING === 'true'

export default defineConfig({
  plugins: [react()],
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
