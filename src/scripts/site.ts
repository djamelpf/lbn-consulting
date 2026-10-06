/**
 * Progressive enhancements. Everything here is optional: the page is complete
 * and readable without it. Motion is skipped under prefers-reduced-motion.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ------------------------------------------------------------- Reveal on scroll */
function setupReveal(): void {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (items.length === 0) return;
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );
  items.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------- Counters */
function setupCounters(): void {
  const counters = document.querySelectorAll<HTMLElement>('[data-count]');
  if (counters.length === 0) return;

  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    if (!Number.isFinite(target)) return;
    if (reduceMotion.matches) {
      el.textContent = String(target);
      return;
    }
    const start = target - Math.min(target, 24);
    const duration = 1200;
    const t0 = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = String(Math.round(start + (target - start) * ease(p)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach((el) => (el.textContent = el.dataset.count ?? ''));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          run(entry.target as HTMLElement);
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------- Current section in nav */
function setupNavState(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('[data-nav]');
  if (links.length === 0 || !('IntersectionObserver' in window)) return;
  const sections = Array.from(links)
    .map((l) => document.getElementById(l.dataset.nav ?? ''))
    .filter((s): s is HTMLElement => s !== null);
  if (sections.length === 0) return;

  const setCurrent = (id: string | null) => {
    links.forEach((l) => {
      if (l.dataset.nav === id) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
  };

  const visible = new Map<string, number>();
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
      let best: string | null = null;
      let bestRatio = 0;
      for (const [id, ratio] of visible) {
        if (ratio > bestRatio) {
          best = id;
          bestRatio = ratio;
        }
      }
      setCurrent(best);
    },
    { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
  );
  sections.forEach((s) => io.observe(s));
}

/* ------------------------------------------------------------- Mobile menu */
function setupMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = document.querySelector<HTMLElement>('[data-mobile-nav]');
  if (!toggle || !panel) return;
  const label = toggle.querySelector<HTMLElement>('[data-menu-label]');
  const iconOpen = toggle.querySelector<SVGElement>('.menu-icon-open');
  const iconClose = toggle.querySelector<SVGElement>('.menu-icon-close');

  const set = (open: boolean) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('hidden', !open);
    iconOpen?.classList.toggle('hidden', open);
    iconClose?.classList.toggle('hidden', !open);
    if (label) label.textContent = open ? (toggle.dataset.labelClose ?? '') : (toggle.dataset.labelOpen ?? '');
  };

  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) set(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      set(false);
      toggle.focus();
    }
  });
}

/* ------------------------------------------------------------- Dependency connectors (expertise) */
function setupConnectors(): void {
  const root = document.querySelector<HTMLElement>('[data-connectors]');
  if (!root) return;
  const svg = root.querySelector<SVGSVGElement>('svg[data-connector-layer]');
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-card]'));
  if (!svg || cards.length === 0) return;

  const byId = new Map(cards.map((c) => [c.dataset.card ?? '', c]));
  const pairs = new Set<string>();
  for (const card of cards) {
    const id = card.dataset.card ?? '';
    for (const target of (card.dataset.links ?? '').split(/\s+/).filter(Boolean)) {
      if (!byId.has(target)) continue;
      pairs.add([id, target].sort().join('|'));
    }
  }

  const draw = () => {
    const wide = window.matchMedia('(min-width: 64rem)').matches;
    svg.replaceChildren();
    root.classList.toggle('has-connectors', wide);
    if (!wide) return;
    const r0 = root.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${r0.width} ${r0.height}`);
    svg.setAttribute('width', String(r0.width));
    svg.setAttribute('height', String(r0.height));
    for (const pair of pairs) {
      const [a, b] = pair.split('|') as [string, string];
      const ra = byId.get(a)!.getBoundingClientRect();
      const rb = byId.get(b)!.getBoundingClientRect();
      const ax = ra.left - r0.left + ra.width / 2;
      const ay = ra.top - r0.top + ra.height / 2;
      const bx = rb.left - r0.left + rb.width / 2;
      const by = rb.top - r0.top + rb.height / 2;
      const dx = (bx - ax) * 0.5;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${ax},${ay} C${ax + dx},${ay} ${bx - dx},${by} ${bx},${by}`);
      path.setAttribute('class', 'connector');
      path.dataset.a = a;
      path.dataset.b = b;
      svg.appendChild(path);
    }
  };

  const highlight = (id: string | null) => {
    svg.querySelectorAll<SVGPathElement>('path').forEach((p) => {
      p.classList.toggle('is-active', id !== null && (p.dataset.a === id || p.dataset.b === id));
    });
    cards.forEach((c) => {
      const links = (c.dataset.links ?? '').split(/\s+/);
      const source = id !== null ? byId.get(id) : undefined;
      const linkedFromSource = source ? (source.dataset.links ?? '').split(/\s+/).includes(c.dataset.card ?? '') : false;
      c.classList.toggle('is-linked', id !== null && c.dataset.card !== id && (links.includes(id) || linkedFromSource));
    });
  };

  for (const card of cards) {
    const id = card.dataset.card ?? null;
    card.addEventListener('pointerenter', () => highlight(id));
    card.addEventListener('pointerleave', () => highlight(null));
    card.addEventListener('focusin', () => highlight(id));
    card.addEventListener('focusout', () => highlight(null));
  }

  draw();
  let frame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(draw);
  });
  // Fonts loading can change card heights.
  document.fonts?.ready.then(draw).catch(() => undefined);
}

/* ------------------------------------------------------------- Cursor halo on the hero grid */
function setupHalo(): void {
  const hero = document.querySelector<HTMLElement>('[data-halo]');
  if (!hero || !finePointer.matches || reduceMotion.matches) return;
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
    hero.classList.add('halo-on');
  });
  hero.addEventListener('pointerleave', () => hero.classList.remove('halo-on'));
}

setupReveal();
setupCounters();
setupNavState();
setupMenu();
setupConnectors();
setupHalo();
