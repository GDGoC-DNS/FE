import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/v3': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/swagger-ui': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
