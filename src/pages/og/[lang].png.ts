/**
 * Open Graph image, generated at build time for each locale: /og/fr.png, /og/en.png
 * Rendered with satori (HTML → SVG) then resvg (SVG → PNG). Same tokens as the site.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const getStaticPaths: GetStaticPaths = () => [{ params: { lang: 'fr' } }, { params: { lang: 'en' } }];

const fontsDir = path.resolve(process.cwd(), 'src/assets/fonts');

const colors = {
  bg: '#f7f8fa',
  fg: '#0b1220',
  muted: '#475569',
  line: '#d7dce5',
  accent: '#1d4ed8',
  hi: '#c8f03c',
};

// Minimal element helper (satori accepts React-like element objects).
type Node = { type: string; props: Record<string, unknown> & { children?: unknown } };
const h = (type: string, props: Record<string, unknown>, ...children: unknown[]): Node => {
  // satori requires an explicit display on every element with several children.
  const style = { ...(type === 'div' ? { display: 'flex' } : {}), ...((props.style as object) ?? {}) };
  const out: Node = { type, props: { ...props, style } };
  if (children.length === 1) out.props.children = children[0];
  else if (children.length > 1) out.props.children = children;
  return out;
};

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang === 'en' ? 'en' : 'fr';
  const entry = await getEntry('site', lang);
  if (!entry) return new Response('Not found', { status: 404 });
  const { meta, hero } = entry.data;

  const [display, body, mono] = await Promise.all([
    readFile(path.join(fontsDir, 'SpaceGrotesk-Bold.ttf')),
    readFile(path.join(fontsDir, 'IBMPlexSans-Regular.ttf')),
    readFile(path.join(fontsDir, 'IBMPlexMono-Medium.ttf')),
  ]);

  const gridCol = 1200 / 12;
  const columns = Array.from({ length: 11 }, (_, i) =>
    h('div', {
      style: {
        position: 'absolute',
        left: `${(i + 1) * gridCol}px`,
        top: 0,
        width: '1px',
        height: '630px',
        backgroundColor: colors.line,
      },
    }),
  );

  const tree = h(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        backgroundColor: colors.bg,
        color: colors.fg,
        fontFamily: 'IBM Plex Sans',
        position: 'relative',
      },
    },
    ...columns,
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', fontFamily: 'IBM Plex Mono', fontSize: '22px', letterSpacing: '2px', color: colors.muted } },
      h('span', { style: { color: colors.accent } }, '§ 00'),
      h('span', { style: { margin: '0 14px' } }, '—'),
      h('span', {}, meta.ogSubtitle.toUpperCase()),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column' } },
      h('div', { style: { fontFamily: 'Space Grotesk', fontSize: '112px', fontWeight: 700, letterSpacing: '-5px', lineHeight: 1 } }, meta.ogTitle),
      h(
        'div',
        { style: { display: 'flex', marginTop: '28px', fontSize: '40px', lineHeight: 1.2, color: colors.fg } },
        h('span', { style: { backgroundColor: colors.hi, padding: '0 10px' } }, meta.ogTagline),
      ),
    ),
    h(
      'div',
      { style: { display: 'flex', justifyContent: 'space-between', fontFamily: 'IBM Plex Mono', fontSize: '20px', letterSpacing: '2px', color: colors.muted } },
      h('span', {}, 'LBN CONSULTING · LILLE'),
      h('span', {}, hero.meta[1] ? `${hero.meta[1].value.toUpperCase()}` : ''),
    ),
    h('div', { style: { position: 'absolute', left: '40px', top: '40px', width: '16px', height: '16px', borderTop: `3px solid ${colors.accent}`, borderLeft: `3px solid ${colors.accent}` } }),
    h('div', { style: { position: 'absolute', right: '40px', bottom: '40px', width: '16px', height: '16px', borderBottom: `3px solid ${colors.accent}`, borderRight: `3px solid ${colors.accent}` } }),
  );

  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Space Grotesk', data: display, weight: 700, style: 'normal' },
      { name: 'IBM Plex Sans', data: body, weight: 400, style: 'normal' },
      { name: 'IBM Plex Mono', data: mono, weight: 500, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
