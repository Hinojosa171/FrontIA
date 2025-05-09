import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'https://back-ia.vercel.app',
        changeOrigin: true,
      }
    }
  }
})
