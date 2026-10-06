import { getRelativeLocaleUrl } from 'astro:i18n';

export type Locale = 'fr' | 'en';

export const locales: Locale[] = ['fr', 'en'];
export const defaultLocale: Locale = 'fr';

export const htmlLang: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB' };
export const ogLocale: Record<Locale, string> = { fr: 'fr_FR', en: 'en_GB' };

/** Home path of a locale, base-aware (e.g. "/lbn-consulting/" or "/lbn-consulting/en/"). */
export function homePath(locale: Locale): string {
  return getRelativeLocaleUrl(locale, '');
}

/**
 * Resolve a content href against the current base path.
 * - "https://…" and "mailto:" are returned as-is
 * - "#section" stays a fragment
 * - "/mentions-legales/" becomes "<base>/mentions-legales/"
 */
export function resolveHref(href: string): string {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${href.startsWith('/') ? href : `/${href}`}`;
}

export function isExternal(href: string): boolean {
  return /^https?:/.test(href);
}

/** Path of the same page in the other locale (one-page site: home ↔ home, legal ↔ legal). */
export function alternatePath(locale: Locale, kind: 'home' | 'legal'): string {
  if (kind === 'home') return homePath(locale);
  return resolveHref(locale === 'fr' ? '/mentions-legales/' : '/en/legal-notice/');
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'fr' ? 'en' : 'fr';
}
