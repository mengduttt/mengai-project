import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Biar kalau ada update, otomatis ke-load
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'], // Aset tambahan
      devOptions: {
        enabled: true // PENTING: Biar bisa ditest di localhost
      },
      manifest: {
        name: 'MengAi - AI Super Assistant', // Nama Panjang
        short_name: 'MengAi', // Nama di bawah icon HP
        description: 'AI Canggih dengan fitur Voice, Vision, dan Image Generation.',
        theme_color: '#09090b', // Warna bar atas HP (Status bar)
        background_color: '#09090b', // Warna splash screen
        display: 'standalone', // Hapus address bar browser (Full App Feel)
        orientation: 'portrait', // Kunci potrait (opsional)
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png', // Icon ukuran sedang
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png', // Icon ukuran besar (Splash screen)
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable' // Biar iconnya pas di Android yg bulet/kotak
          }
        ]
      }
    })
  ],
  server: {
    host: true // Biar bisa diakses dari HP via IP Address
  }
});