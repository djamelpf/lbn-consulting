// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

/**
 * Deployment target.
 *
 * - Default (no env): custom domain → https://www.lbn-consulting.com/
 * - Fallback: set SITE_URL=https://djamelpf.github.io and BASE_PATH=/lbn-consulting
 *   to publish on the GitHub Pages project URL (see .github/workflows/deploy.yml).
 */
const SITE_URL = process.env.SITE_URL ?? 'https://www.lbn-consulting.com';
const BASE_PATH = process.env.BASE_PATH ?? '/';
const BUILD_DATE = new Date().toISOString();

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  trailingSlash: 'always',
  output: 'static',

  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    sitemap({
      i18n: { defaultLocale: 'fr', locales: { fr: 'fr-FR', en: 'en-GB' } },
      filter: (page) => !page.includes('/og/') && !page.includes('/404'),
      serialize(item) {
        item.lastmod = BUILD_DATE;
        return item;
      },
    }),
  ],

  fonts: [
    {
      name: 'Space Grotesk',
      cssVariable: '--astro-font-display',
      provider: fontProviders.google(),
      weights: ['500 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Arial', 'sans-serif'],
      display: 'swap',
    },
    {
      name: 'IBM Plex Sans',
      cssVariable: '--astro-font-body',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
      display: 'swap',
    },
    {
      name: 'IBM Plex Mono',
      cssVariable: '--astro-font-mono',
      provider: fontProviders.google(),
      weights: [400, 500],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      display: 'swap',
    },
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
