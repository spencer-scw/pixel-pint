import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      "skrewt-station.local"
    ],
    proxy: {
      '/lospec-api': {
        target: 'https://lospec.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lospec-api/, '')
      }
    }
  }
})
