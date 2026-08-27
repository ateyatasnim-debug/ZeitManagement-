import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// VITE_BASE_PATH is set by the GitHub Pages workflow (project pages are
// served from https://<user>.github.io/<repo>/, not the domain root).
// Left unset, the app builds for a root deployment (Vercel/Netlify/local).
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts']
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg'],
      manifest: {
        name: 'FocusFlow – Pomodoro & Gamification',
        short_name: 'FocusFlow',
        description: 'Pomodoro-Timer mit Statistik, Gamification, Projekten und Study Mode.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        // Relative to the manifest's own location so it works both at the
        // domain root and under a GitHub Pages subpath.
        start_url: '.',
        scope: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ]
})
