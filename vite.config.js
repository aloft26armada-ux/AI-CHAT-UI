import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For Vercel use '/', for GitHub Pages use '/AI-CHAT-UI/'
  base: '/',
  server: { port: 5173 },
  build: { target: 'esnext', outDir: 'dist' },
  optimizeDeps: { exclude: ['@mlc-ai/web-llm'] },
  worker: { format: 'es' }
})