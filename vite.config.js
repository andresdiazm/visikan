import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages needs /visikan/ base; Vercel and dev use /
  base: command === 'build' && !process.env.VERCEL ? '/visikan/' : '/',
}))
