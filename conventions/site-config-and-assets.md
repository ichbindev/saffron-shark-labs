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
	showPlug: true,
};
```

- `title` / `description` are the fallbacks `BaseHead.astro` uses when a page passes no `seo`.
- `url` has **no trailing slash**. Note that `site` in `astro.config.mjs` *does* have one, and that is the value canonical URLs and the sitemap are actually built from. Changing the domain means changing both.
- `enableThemeSwitcher` gates whether `ThemeProvider` renders.
- `showPlug` controls the footer's "Get This Template" link back to the upstream Odyssey theme. It is currently `true`. Turning it off is a content decision — ask before flipping it.

### `nav.js` — named export `nav`

Header links, each `{ title, slug }`. Slugs are absolute paths (`/company/about`). Adding a page does not add it here; do it explicitly.

### `footer.js` — named exports `footerSocials` and `footerLists`

`footerSocials` entries are `{ name, url, icon }` where `icon` is an Iconify name (`mdi:github`). `footerLists` is an array of `{ title, items: [{ title, slug }] }` link columns.

Both configs are consumed in `Page.astro` and passed down as props — components never import config directly. `BaseHead.astro` importing `settings.js` is the one exception, because it has no parent to receive props from.

## Icons

Use `astro-icon`, not inline SVG:

```astro
import { Icon } from 'astro-icon/components';

<Icon name="ic:baseline-chevron-right" />
<Icon name="mdi:github" width={24} height={24} />
```

Only the `ic` and `mdi` icon sets are installed. Using a name from another set means adding an `@iconify-json/*` devDependency — check whether an equivalent already exists in `ic` or `mdi` first.

`src/icons/icons.js` holds hand-pasted SVG strings for Twitter, YouTube, GitHub, and Instagram, left over from the theme. Nothing imports it. Do not add to it; use `<Icon>`.

The Lit theme switcher imports its own SVG strings from `src/components/theme-switcher/icons.ts` because a custom element's shadow DOM can't use the Astro component. That one stays.

## `public/`

Served verbatim at the site root — `public/assets/images/logo.png` is `/assets/images/logo.png`. Reference these with plain absolute-path strings; they are not imported or processed.

- `public/assets/fonts/` — Lato and Roboto Serif, self-hosted as `.woff2` + `.woff`, declared in `src/styles/typography.css` with `font-display: swap`. Self-hosting is deliberate: no Google Fonts request at runtime. Adding a weight means adding both file formats and an `@font-face` block.
- `public/assets/images/` — page imagery, organized by page (`home/`, `about/`).
- `public/favicon.png`, `public/social.png` — favicon and the default Open Graph card.

**Image discipline.** Hero images are full-bleed and are the heaviest thing on the page; they have already been re-encoded once to shrink them. Resize and compress before committing, and give every `<img>` a real `alt`. `astro:assets` is not in use — images are plain `<img>` tags inside `<picture>` — so nothing optimizes them for you at build time.

`assets/` at the repo root (not `public/assets/`) holds two README badge SVGs from the upstream theme and is not part of the site.

## Build and deploy

`netlify.toml` is the whole deploy config: publish `dist/`, command `npm run build`. Branch and environment settings live in the Netlify dashboard, not in the repo. `@astrojs/sitemap` generates `dist/sitemap.xml` from `site` in `astro.config.mjs`.

`dist/` and `node_modules/` are gitignored. `.astro/` is partly tracked (`settings.json`, `types.d.ts`) with `icon.d.ts` ignored — leave that arrangement alone.
