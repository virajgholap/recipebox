import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        // Split the two big third-party dependencies out of the app chunk.
        // They change far less often than our code, so a deploy no longer
        // invalidates them in everyone's cache.
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js', 'api/**/*.test.js'],
  },
})
