import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // An artifact, not a browser tab: installable, and the shell + code cached
    // so a phone with bad table wifi still opens to its sheet. Data still
    // comes from Supabase (or the device cache) — the service worker only
    // caches the app itself. Audio is synthesized, so nothing big to cache.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icons/*.png'],
      manifest: {
        name: 'The Song the Sea Forgot',
        short_name: 'Sea Forgot',
        description: 'A campaign companion. The carnival never charges coin.',
        theme_color: '#0B1416',
        background_color: '#0B1416',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        // Never intercept Supabase; realtime and RPCs must hit the network.
        navigateFallbackDenylist: [/^\/rest\//, /^\/realtime\//, /^\/storage\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react'
          if (id.includes('node_modules/@supabase')) return 'supabase'
          if (id.includes('node_modules/tone/')) return 'tone'
          if (id.includes('dice-box-threejs')) return 'dice3d'
          return undefined
        },
      },
    },
  },
})
