# AGENTS.md

Guidelines for AI agents working in this repository.

## Project Overview

**Saffron Shark Labs** is the public marketing site for a software development and consulting company. It is a small, static, content-first site — a handful of pages, no backend, no database, no auth. It is built on the [Odyssey theme](https://github.com/treefarmstudio/odyssey-theme) for Astro and deployed to Netlify from `main`.

Because the site is small and static, the bar for changes is different from an application repo: keep the dependency footprint flat, keep pages hand-written, and prefer editing an existing component over introducing a new abstraction.

## Tech Stack

- **Framework:** Astro 4 (static output, file-based routing)
- **Components:** `.astro` files; one Lit web component (`theme-switcher`) via `@astrojs/lit`
- **Styling:** Plain CSS — global stylesheets in `src/styles/` plus Astro scoped `<style>` blocks. No Tailwind, no CSS framework, no preprocessor.
- **Icons:** `astro-icon` with the `@iconify-json/ic` and `@iconify-json/mdi` sets
- **Content:** `@astrojs/mdx` is installed but no MDX content exists today
- **Package Manager:** npm (`package-lock.json` is the committed lockfile; Netlify runs `npm run build`)

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Dev server (localhost:4321)
npm run build     # Production build to dist/ — the only real correctness check in this repo
npm run preview   # Serve the built dist/ locally
npm run format    # Prettier over the whole repo
```

There is no lint script, no test suite, and no typecheck script. `npm run build` is what catches broken imports, bad component props, and invalid Astro syntax — run it before considering a change done. If a change is visual, also run `npm run dev` and look at the affected page, in both light and dark theme.

## Code Conventions

- **Formatting:** Prettier with `prettier-plugin-astro`. Tabs for indentation, single quotes, semicolons, `arrowParens: "avoid"`. Some existing files are still 2-space indented from the upstream theme — do not reformat a file wholesale as part of an unrelated change; that buries the real diff. Format the files you actually touch.
- **Imports:** `src/components/odyssey-theme.js` is a barrel re-exporting the theme's shared components. Import from `@components/odyssey-theme` for anything it exports; use a relative path for components it does not (the hero sections, `ContactForm`, `Logo`, `BaseHead`). Path aliases are declared in `tsconfig.json` (`@components/*`, `@layouts/*`, `@styles/*`, `@utils/*`, `@config`, `@icons`).
- **Components are props-in, slots-out.** Destructure `Astro.props` at the top of the frontmatter, give optional props defaults inline, and expose content through named `<slot>`s rather than string props. See `src/components/sections/heros/TextAndImageHero.astro` for the pattern.
- **Styles are colocated and scoped.** A component's CSS lives in its own `<style>` block. Only put a rule in `src/styles/` if it genuinely applies site-wide.
- **Colors, spacing, radii, and fonts come from CSS custom properties** defined in `src/styles/theme.css`. Never hard-code a hex color in a component — the site has a light/dark theme switcher and a literal color breaks one of them.
- **No client-side JavaScript unless the feature requires it.** Pages ship zero JS by default; keep it that way.
- **TypeScript is optional here.** Config files (`src/config/*.js`), the icons module, and helpers are plain JavaScript. `.astro` frontmatter is TypeScript-capable and a few components declare `export interface Props`, but most do not. Match the file you are editing rather than converting it.

## Key Directories

| Path                        | Purpose                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `src/pages/`                | Routes — file path is the URL. `404.astro` is the not-found page.        |
| `src/layouts/`              | `Base.astro` (html shell) and `Page.astro` (header + footer chrome)      |
| `src/components/core/`      | Header, Footer, Container, SkipLink, Plug                               |
| `src/components/sections/`  | Page-level content blocks, including `heros/`                            |
| `src/components/form-fields/` | Input, select, textarea primitives                                     |
| `src/components/forms/`     | Assembled forms (`ContactForm.astro`)                                    |
| `src/config/`               | Site settings, nav items, footer lists and socials                       |
| `src/styles/`               | `index.css` imports reset → theme → typography → global                  |
| `public/assets/`            | Fonts and images, served verbatim at `/assets/...`                       |
| `dist/`                     | Build output — gitignored, never edit                                    |

## Conventions

Before writing code, check the relevant conventions file:

| Topic                          | File                                          |
| ------------------------------ | --------------------------------------------- |
| Writing and using components   | `conventions/astro-components.md`             |
| CSS, themes, responsive design | `conventions/styling-and-theming.md`          |
| Adding or editing a page, SEO  | `conventions/pages-and-seo.md`                |
| The contact form               | `conventions/forms.md`                        |
| Site config, images, fonts     | `conventions/site-config-and-assets.md`       |

## Things to Avoid

- Do not edit anything in `dist/` — it is generated by `npm run build` and gitignored.
- Do not install with `pnpm` or `yarn`. `package-lock.json` is the lockfile Netlify builds from; a second lockfile will break the build.
- Do not add a CSS framework, a UI library, or a client-side framework to solve a problem plain CSS and an `.astro` file can solve.
- Do not hard-code colors, font sizes, or radii — use the custom properties in `src/styles/theme.css` and `src/styles/typography.css`.
- Do not add tracking, analytics, or third-party scripts without being asked. `BaseHead.astro` has an empty analytics slot already guarded against `localhost`; leave it empty unless the change is specifically to add analytics.
- Do not delete the honeypot field in `ContactForm.astro`. It looks like dead code and is not — see `conventions/forms.md`.
- Do not commit large unoptimized images. See `conventions/site-config-and-assets.md`.
- Do not leave commented-out blocks of markup behind. `index.astro` already carries one; don't add more.
