/**
 * Site-wide settings that are not content (content lives in src/content/).
 */

/**
 * Umami Cloud website ID (Settings → Websites → Edit → "Website ID").
 * Empty on purpose: analytics are disabled and no script is injected.
 * If you enable it one day, update the "Données personnelles et cookies"
 * section of src/content/legal/*.md and the footer `madeWith` wording.
 */
export const umamiWebsiteId = '';

/** Umami Cloud script URL (EU region). */
export const umamiScriptUrl = 'https://cloud.umami.is/script.js';

/**
 * Hostnames where tracking is allowed. Anything else (localhost, previews)
 * is ignored by the tracker thanks to `data-domains`.
 */
export const umamiDomains = ['www.lbn-consulting.com', 'lbn-consulting.com', 'djamelpf.github.io'];
