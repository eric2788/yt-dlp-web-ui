import { VitePWA } from 'vite-plugin-pwa'
import ViteYaml from '@modyfi/vite-plugin-yaml'
import { defineConfig } from 'vite'
import million from 'million/compiler'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(() => {
  return {
    plugins: [
      million.vite({ auto: true }),
      react(),
      ViteYaml(),
      VitePWA({ 
        registerType: 'autoUpdate',
        manifestFilename: 'manifest.json',
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
        },
        devOptions: {
          enabled: true,
        },
        useCredentials: true,
        manifest: {
          name: 'YT-Dlp-Web-UI',
          short_name: 'YT-Dlp WEB',
          description: 'The web ui of YT-Dlp',
          theme_color: '#ff0000',
          background_color: '#ffffff',
          id: '/',
          display: 'standalone',
          icons: [
            {
              src: 'icon-128x128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: 'icon-155x155.png',
              sizes: '155x155',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            }
          ],
          screenshots: [
            {
              src: 'screenshot.webp',
              sizes: '1367x1080',
              type: 'image/webp'
            },
          ]
        }
      })
    ],
    base: '',
    build: {
      emptyOutDir: true,
    }
  }
})
