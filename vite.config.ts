import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the site from https://zdevmonz.github.io/SoLuTion/,
  // so built asset URLs need that prefix. `npm run dev` stays at /.
  base: command === 'build' ? '/SoLuTion/' : '/',
}))
