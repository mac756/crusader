import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/crusader/', // Set to /crusader/ for GitHub Pages deployment
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
