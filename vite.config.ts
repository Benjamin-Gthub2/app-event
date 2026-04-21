import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // Esto genera un certificado HTTPS temporal
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9001',
        changeOrigin: true,
      },
    },
    host: true, // Acepta conexiones externas
    https: true, // Fuerza el uso de HTTPS
  },
})
