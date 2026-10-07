import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ label: z.string(), href: z.string() });

/**
 * One JSON file per locale in src/content/site/ (fr.json, en.json).
 * Edit the copy there — components never hard-code text.
 */
const site = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/site' }),
  schema: z.object({
    meta: z.object({
      title: z.string(),
      description: z.string(),
      ogTitle: z.string(),
      ogSubtitle: z.string(),
      ogTagline: z.string(),
      jobTitle: z.string(),
      keywords: z.array(z.string()),
      areaServed: z.array(z.string()),
    }),
    a11y: z.object({
      skipToContent: z.string(),
      mainNav: z.string(),
      langSwitch: z.string(),
      openMenu: z.string(),
      closeMenu: z.string(),
      externalLink: z.string(),
      portraitAlt: z.string(),
    }),
    nav: z.object({
      items: z.array(z.object({ id: z.string(), label: z.string() })),
      cta: link,
    }),
    hero: z.object({
      eyebrow: z.string(),
      name: z.string(),
      role: z.string(),
      hook: z.string(),
      symptoms: z.array(z.string()).length(4),
      promise: z.string(),
      ctaPrimary: link,
      ctaSecondary: link,
      scrollHint: z.string(),
      meta: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
    about: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()),
      facts: z.array(
        z.object({
          value: z.number(),
          prefix: z.string().optional(),
          suffix: z.string().optional(),
          label: z.string(),
        }),
      ),
    }),
    expertise: z.object({
      title: z.string(),
      intro: z.string(),
      connectorsHint: z.string(),
      items: z.array(
        z.object({
          id: z.string(),
          icon: z.string(),
          title: z.string(),
          description: z.string(),
          tags: z.array(z.string()),
          links: z.array(z.string()),
        }),
      ),
      certifications: z.object({ title: z.string(), items: z.array(z.string()) }),
    }),
    journey: z.object({
      title: z.string(),
      intro: z.string(),
      items: z.array(
        z.object({
          period: z.string(),
          role: z.string(),
          org: z.string(),
          detail: z.string(),
          current: z.boolean().optional(),
        }),
      ),
      trust: z.object({ title: z.string(), names: z.array(z.string()) }),
      community: z.object({
        title: z.string(),
        items: z.array(z.object({ title: z.string(), detail: z.string() })),
      }),
      cta: link,
      ctaMalt: link,
    }),
    berceau: z.object({
      title: z.string(),
      role: z.string(),
      pitch: z.array(z.string()),
      values: z.array(z.object({ title: z.string(), detail: z.string() })),
      cta: link,
      note: z.string(),
    }),
    lbn: z.object({
      title: z.string(),
      text: z.string(),
      activities: z.array(z.object({ title: z.string(), detail: z.string() })),
      legal: link,
      facts: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
    contact: z.object({
      title: z.string(),
      text: z.string(),
      cta: link,
      ctaMalt: link,
      ctaCalendly: link,
      aside: z.string(),
    }),
    footer: z.object({
      copyright: z.string(),
      legal: link,
      linkedin: link,
      malt: link,
      calendly: link,
      madeWith: z.string(),
    }),
    faq: z.object({
      title: z.string(),
      intro: z.string(),
      items: z.array(z.object({ q: z.string(), a: z.string() })),
    }),
    notFound: z.object({ title: z.string(), text: z.string(), back: z.string() }),
  }),
});

/** Legal notice pages (Markdown), one per locale: src/content/legal/fr.md, en.md */
const legal = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/legal' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updated: z.string(),
    backLabel: z.string(),
  }),
});

export const collections = { site, legal };
