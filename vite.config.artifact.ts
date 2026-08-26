import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Separate build target: bundles the whole app into one self-contained HTML
// file (no service worker / manifest) so it can run inside a sandboxed
// artifact iframe. The regular `vite.config.ts` (PWA-enabled) stays the
// build used for real deployments / self-hosting.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist-artifact',
    cssCodeSplit: false,
    assetsInlineLimit: 100_000_000
  }
})
