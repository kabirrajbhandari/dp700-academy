import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative base makes the build work on ANY host or subpath —
  // Netlify/Vercel/Cloudflare root domains, GitHub Pages project sites,
  // or even opened directly from disk. No per-host tweaking needed.
  base: './',
  server: { port: 5175, open: true },
})
