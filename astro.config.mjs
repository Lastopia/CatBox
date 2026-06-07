// @ts-check
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkConceptCards from './src/utils/remarkConceptCards.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://Lastopia.github.io',
  base: '/CatBox/',
  markdown: {
    remarkPlugins: [remarkMath, remarkConceptCards],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    server: {
      watch: {
        ignored: ['**/*.mp4', '**/*.webm', '**/*.mov'],
      },
    },
  },
});
