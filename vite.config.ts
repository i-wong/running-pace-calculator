import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the build also works inside a Capacitor (iOS/Android) webview,
  // where assets are served from the local filesystem rather than a domain root.
  base: './',
})
