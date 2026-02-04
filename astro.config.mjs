// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://resume.takovibe.com',
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [react(), sitemap()],
  server: {
    host: false,
    port: process.env.PORT ? parseInt(process.env.PORT) : 4322,
  },
  vite: {
    plugins: [tailwindcss()]
  }
});