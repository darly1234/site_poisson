// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://editorapoisson.com.br',
  trailingSlash: 'always',
  redirects: {
    '/chamadas': '/chamadas-abertas'
  },
  integrations: [react(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['lucide-react', 'three', '@react-three/fiber', '@react-three/drei']
    }
  }
});