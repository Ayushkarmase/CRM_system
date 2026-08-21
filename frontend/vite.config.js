import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,

    // Allows Railway/Vite preview hostname
    allowedHosts: true,

    // Local development API proxy
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '4173'),
    allowedHosts: true,
  },
})