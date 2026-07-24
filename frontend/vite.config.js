import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { compression } from 'vite-plugin-compression2'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    compression(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024,
      },
      manifest: {
        name: 'Family Finance',
        short_name: 'FamFin',
        description: 'Family Finance Management',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512 any',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    // Target modern browsers (drop legacy IE support)
    target: 'es2020',

    // Warn when a single chunk exceeds 500 KB (stricter limit)
    chunkSizeWarningLimit: 500,

    // Clean output directory before each build
    emptyOutDir: true,

    // Enable CSS code splitting per chunk
    cssCodeSplit: true,

    // Source maps only for staging — disable for production to reduce size
    sourcemap: false,

    rollupOptions: {
      output: {
        // Content-hash filenames for long-lived browser caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',

        // Manual chunk splitting to optimise loading
        // NOTE: rolldown (Vite 8) requires manualChunks to be a function, not a plain object.
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('@tanstack/vue-query')) {
              return 'vendor-query';
            }
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor-vue';
            }
            if (id.includes('chart.js') || id.includes('vue-chartjs')) {
              return 'vendor-charts';
            }
            if (id.includes('jspdf')) {
              return 'vendor-pdf';
            }
            if (id.includes('bootstrap') || id.includes('@popperjs')) {
              return 'vendor-bootstrap';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
          }
        },
      },
    },
  },

  // Preview server (vite preview) — mirrors production paths
  preview: {
    port: 4173,
    strictPort: true,
  },
})
