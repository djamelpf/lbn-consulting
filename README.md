# lbn-consulting.com — site de Djamel Labani

Site vitrine one-page, bilingue (FR par défaut, EN sur `/en/`), 100 % statique.
Il présente Djamel Labani, LBN Consulting et Le Berceau de Location.

- **Stack** : [Astro 7](https://astro.build) + Tailwind CSS 4 + TypeScript, animations en CSS natif (+ un peu de JS progressif), `prefers-reduced-motion` respecté.
- **Hébergement** : GitHub Pages, déploiement automatique par GitHub Actions à chaque push sur `main`.
- **Design** : direction « Système » (grille suisse, précision technique) choisie parmi les trois propositions de [`design-directions/index.html`](design-directions/index.html).

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321/lbn-consulting/ (base par défaut en local, voir Déploiement)
npm run build      # génère dist/
npm run preview    # sert dist/ en local
npx astro check    # vérification TypeScript / Astro
```

Node 22.12 ou plus récent est requis (`engines` dans `package.json`).

> En local, le site est servi sous le préfixe `/lbn-consulting/` (même chemin que l'URL github.io). Voir [Déploiement](#déploiement) pour passer au domaine personnalisé.

## Modifier le contenu

Tout le texte vit dans des fichiers séparés, jamais dans les composants.

| Quoi | Où |
|---|---|
| Textes de la page (FR) | [`src/content/site/fr.json`](src/content/site/fr.json) |
| Textes de la page (EN) | [`src/content/site/en.json`](src/content/site/en.json) |
| Mentions légales (FR) | [`src/content/legal/fr.md`](src/content/legal/fr.md) |
| Legal notice (EN) | [`src/content/legal/en.md`](src/content/legal/en.md) |

Les deux JSON ont exactement la même structure, validée au build par le schéma de
[`src/content.config.ts`](src/content.config.ts) : une clé manquante ou un type incorrect fait échouer `npm run build` avec un message explicite.

Quelques repères :

- `nav.items` définit **l'ordre, les ancres et la numérotation** des sections (`01` à `06`). Les `id` doivent rester identiques entre FR et EN uniquement s'ils servent de lien externe ; sinon chaque langue peut avoir ses propres ancres (c'est le cas : `#a-propos` / `#about`).
- `hero.symptoms` attend exactement 4 entrées (ce sont les quatre mots soulignés du hero).
- `expertise.items[].links` liste les `id` des cartes reliées par les connecteurs (survol sur desktop).
- `expertise.items[].icon` prend une valeur parmi celles d'[`src/components/Icon.astro`](src/components/Icon.astro) (`compass`, `map`, `search`, `layers`, `gauge`, `users`…). Pour ajouter une icône, ajoutez son tracé SVG dans ce fichier.
- `journey.items[].current: true` affiche le marqueur « en cours » (carré jaune acide).
- Les liens internes s'écrivent sans préfixe (`/mentions-legales/`) : le préfixe de déploiement est ajouté automatiquement.

## Ajouter ou changer les photos

Déposez vos portraits dans **`src/assets/portraits/`** :

- `hero.jpg` : portrait du hero (carré ou 4:5 recommandé, 2000 px de côté suffisent).
- `about.jpg` : portrait de la section À propos (optionnel, sinon `hero.jpg` est réutilisé).

Formats acceptés : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. Au build, Astro génère automatiquement les variantes AVIF et WebP aux tailles responsives (360 à 1080 px), avec un JPG de secours. Si aucun fichier n'est présent, un placeholder élégant s'affiche à la place.

Pourquoi `src/assets/` et pas `public/` ? Les fichiers de `public/` sont copiés tels quels, sans optimisation. Pour tenir les objectifs Lighthouse (formats modernes, tailles adaptées), les images doivent passer par `src/assets/`.

Le texte alternatif se modifie dans `a11y.portraitAlt` (FR et EN).

## Image de partage (Open Graph)

Générée au build pour chaque langue : `/og/fr.png` et `/og/en.png` (1200 × 630), à partir de `meta.ogTitle`, `meta.ogSubtitle` et `meta.ogTagline`. Le rendu est fait par [`src/pages/og/[lang].png.ts`](src/pages/og/[lang].png.ts) avec les polices TTF de `src/assets/fonts/`.

## Déploiement

Le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) construit et publie le site à chaque push sur `main`.

### Prérequis GitHub

1. Dans le dépôt : **Settings → Pages → Build and deployment → Source : GitHub Actions**.
2. GitHub Pages n'est disponible sur un dépôt **privé** qu'avec un plan payant (Pro/Team). Sur un compte gratuit, le dépôt doit être **public**.

### Étape 1 : URL github.io (mode de secours)

Mode 1 du bloc `env` du workflow. Le site est alors publié sur `https://djamelpf.github.io/lbn-consulting/`. En local, `npm run dev` et `npm run build` utilisent ce mode par défaut (préfixe `/lbn-consulting/`).

### Étape 2 : brancher www.lbn-consulting.com (mode actif)

Fait le 6 octobre 2026 : DNS configuré chez OVH, workflow en mode 2.

1. **DNS**, chez le registrar du domaine :
   - `www` → enregistrement **CNAME** vers `djamelpf.github.io.`
   - domaine nu `lbn-consulting.com` → enregistrements **A** vers les IP GitHub Pages :
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
     (et, si proposé, **AAAA** : `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`).
2. Dans `.github/workflows/deploy.yml`, bloc `env`, remplacez le mode 1 par le mode 2 :
   ```yaml
   SITE_URL: https://www.lbn-consulting.com
   BASE_PATH: /
   CUSTOM_DOMAIN: www.lbn-consulting.com
   ```
   Le workflow écrit alors le fichier `CNAME` dans le build (une copie prête à l'emploi se trouve dans [`deploy/CNAME`](deploy/CNAME)).
3. Poussez sur `main`. Puis dans **Settings → Pages**, vérifiez que le domaine `www.lbn-consulting.com` est bien renseigné et cochez **Enforce HTTPS** une fois le certificat émis (quelques minutes à quelques heures après la propagation DNS).
4. Le domaine nu redirige automatiquement vers `www` dès que les enregistrements A sont en place.

Pour développer en local avec les mêmes réglages que la production :

```bash
SITE_URL=https://www.lbn-consulting.com BASE_PATH=/ npm run dev
```

## Qualité

- Accessibilité WCAG AA : contrastes mesurés (cobalt sur fond clair 6,3:1, texte 17:1 ; équivalents en sombre), focus visibles, navigation clavier, `aria-current` sur la section active, textes alternatifs, cibles tactiles ≥ 44 px.
- Clair / sombre selon la préférence système (`prefers-color-scheme`), sans bouton.
- `prefers-reduced-motion` : toutes les animations sont désactivées, l'état final s'affiche directement.
- SEO : balises meta, Open Graph et Twitter Card, `hreflang` FR/EN/x-default, `sitemap-index.xml`, `robots.txt`, données structurées schema.org `Person` + `Organization`.
- Pas de cookie, pas d'analytics, aucun script tiers.

## Arborescence

```
src/
├── content/            # tout le texte (JSON + Markdown)
├── content.config.ts   # schéma de validation du contenu
├── assets/portraits/   # vos photos
├── assets/fonts/       # TTF utilisées pour l'image Open Graph
├── components/         # header, footer, sections…
├── layouts/Base.astro  # <head>, SEO, polices, JSON-LD
├── pages/              # routes : /, /en/, /mentions-legales/, /en/legal-notice/, /og/*.png
├── scripts/site.ts     # enrichissements JS (reveal, compteurs, connecteurs, menu)
└── styles/global.css   # tokens de design, Tailwind, animations
```

## Mesure d'audience (désactivée)

Le site n'embarque aucun outil d'analyse. Un branchement Umami (sans cookie) est prêt mais **désactivé** : `umamiWebsiteId` est vide dans [`src/lib/site.ts`](src/lib/site.ts), donc aucun script n'est chargé. Les attributs `data-umami-event` présents sur les liens (clics LinkedIn par emplacement, lien vers le Berceau, changement de langue, navigation) sont inertes tant qu'aucun identifiant n'est renseigné. Si vous l'activez un jour, mettez à jour la section « Données personnelles et cookies » des mentions légales et le texte `footer.madeWith`.
