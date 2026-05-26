// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://Lastopia.github.io',
  base: '/CatBox/',
  vite: {
    server: {
      watch: {
        ignored: ['**/*.mp4', '**/*.webm', '**/*.mov'],
      },
    },
  },
});
