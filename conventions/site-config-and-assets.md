# Site Config and Assets

## `src/config/`

Content that appears in more than one place lives here, not inline in a component.

### `settings.js` — default export

```js
export default {
	title: `Saffron Shark Labs`,
	description: `Software done right.`,
	url: `https://saffronsharklabs.com`, // No trailing slash!
	name: `Saffron Shark Labs`,
	enableThemeSwitcher: true,
};
```

- `title` / `description` are the fallbacks `BaseHead.astro` uses when a page passes no `seo`.
- `url` has **no trailing slash**, and `test/unit/config.test.js` enforces that. Note that `site` in `astro.config.mjs` _does_ have one, and that is the value canonical URLs and the sitemap are actually built from. Changing the domain means changing both.
- `enableThemeSwitcher` gates whether `ThemeProvider` renders.

Every setting here has to be read by something. `showPlug` used to live in this file and controlled nothing — the footer's only use of it was commented out — so it and the `Plug.astro` component it gated were both removed.

### `nav.js` — named export `nav`

Header links, each `{ title, slug }`. Slugs are absolute paths (`/company/about`). Adding a page does not add it here; do it explicitly.

### `footer.js` — named exports `footerSocials` and `footerLists`

`footerSocials` entries are `{ name, url, icon }` where `icon` is an Iconify name (`mdi:github`). `footerLists` is an array of `{ title, items: [{ title, slug }] }` link columns.

Both configs are consumed in `Page.astro` and passed down as props — components never import config directly. `BaseHead.astro` importing `settings.js` is the one exception, because it has no parent to receive props from.

## Icons

Use `astro-icon`, not inline SVG:

```astro
import {Icon} from 'astro-icon/components';

<Icon name="ic:baseline-chevron-right" />
<Icon name="mdi:github" width={24} height={24} />
```

Only the `ic` and `mdi` icon sets are installed. Using a name from another set means adding an `@iconify-json/*` devDependency — check whether an equivalent already exists in `ic` or `mdi` first.

The Lit theme switcher imports its own SVG strings from `src/components/theme-switcher/icons.ts`, because a custom element's shadow DOM cannot use the Astro component. That file is the only place a hand-pasted SVG belongs. (`src/icons/icons.js` held four more, imported by nothing, and was deleted.)

Pass icon dimensions as numbers (`width={24}`), not strings (`width="24px"`) — `astro-icon` types them as numbers, and `npm run typecheck` fails on the string form.

## Images: `src/assets/`, not `public/`

**Every content image goes in `src/assets/`, is imported, and is rendered through `astro:assets`.** Astro re-encodes it to webp at build time, at the width you ask for, and emits a content-hashed filename that can be cached forever. The four images this site uses were 3.7MB of jpeg/png in `public/`; the same images now ship as 347kB — the logo alone went from 431kB to 3kB.

```astro
---
import { Image } from 'astro:assets';
import aboutImage from '../../assets/images/about/about.jpeg';
---

<Image src={aboutImage} alt="…" width={1200} format="webp" loading="eager" />
```

An image referenced by path from `public/` skips all of that, so `test/build/output.test.ts` fails if any `<img>` on a built page has a `src` outside `/_astro/`.

- **Always pass `width`.** The sources are 2400px squares; 1200 is already 2× the largest display size on this site. Without it Astro emits the image at full size.
- **Let the component set `width`/`height` on the tag.** They are the intrinsic dimensions and they are what stops the page reflowing as the image loads; a build test enforces that both are present.
- **`loading="eager"` / `fetchpriority="high"` on above-the-fold heroes.** They are the largest contentful paint; lazy-loading them makes the page slower, not faster.
- **Every image needs real `alt` text**, and if a variant swaps in at runtime it needs its own.

The home hero has two variants that follow the theme. Because `astro:assets` hashes the output filenames, `theme-switcher.ts` cannot know them — `index.astro` calls `getImage()` for both and passes the results on a `data-theme-variants` attribute, which the switcher reads. Do not reintroduce hardcoded image paths in the switcher.

## `public/`

Served verbatim at the site root and **never processed**. Only three kinds of file belong here:

- `public/assets/fonts/` — Lato and Roboto Serif, self-hosted as `.woff2` + `.woff`, declared in `src/styles/typography.css` with `font-display: swap`. Self-hosting is deliberate: no Google Fonts request at runtime. Adding a weight means adding both file formats and an `@font-face` block.
- `public/favicon.png` — referenced by a literal `<link rel="icon">` path.
- `public/social.png` — the default Open Graph card. It has to stay at a stable, unhashed URL because it is resolved against `Astro.site` and handed to crawlers.

`assets/` at the repo root (not `public/assets/`) holds two README badge SVGs from the upstream theme and is not part of the site.

`test/build/output.test.ts` fails if a built page references an image or font that is not in `dist/`, so a typo'd path is caught in CI rather than in production.

## Build and deploy

`netlify.toml` holds the deploy config — publish `dist/`, command `npm run build` — plus one redirect. Branch and environment settings live in the Netlify dashboard, not in the repo.

`@astrojs/sitemap` v3 emits `sitemap-index.xml` and `sitemap-0.xml`, where the v0.1 the repo used before emitted a single `sitemap.xml`. The redirect in `netlify.toml` keeps the old `/sitemap.xml` URL working for anything already pointing at it — Search Console submissions, crawler caches. **If you resubmit the sitemap to Search Console, submit `/sitemap-index.xml`.** `@astrojs/sitemap` generates `dist/sitemap.xml` from `site` in `astro.config.mjs`.

`dist/` and `node_modules/` are gitignored. `.astro/` is partly tracked (`settings.json`, `types.d.ts`) with `icon.d.ts` ignored — leave that arrangement alone.
