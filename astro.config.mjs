// @ts-check
import { defineConfig } from 'astro/config';
import remarkConceptCards from './src/utils/remarkConceptCards.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://Lastopia.github.io',
  base: '/CatBox/',
  markdown: {
    remarkPlugins: [remarkConceptCards],
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/*.mp4', '**/*.webm', '**/*.mov'],
      },
    },
  },
});
