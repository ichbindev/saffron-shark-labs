# Pages, Layouts, and SEO

## Routing

File-based. `src/pages/index.astro` → `/`, `src/pages/company/about.astro` → `/company/about`. Adding a page means adding a file; there is no route table.

The site is fully static (`astro build` with the default static output). There are no API routes, no server-side rendering, and no dynamic route params today.

## The layout chain

```
Base.astro    html/head/body shell + BaseHead + SkipLink + <main id="content">
  └─ Page.astro    adds Header (nav + Contact button) and Footer, wraps content in #page
       └─ your page
```

**Every page uses `Page.astro`.** `Base.astro` is only for a page that needs to opt out of the site chrome entirely; nothing does that today. Both accept a single `seo` prop.

## Page skeleton

Every page follows this shape — frontmatter imports, an `seo` object, a `<Layout>`:

```astro
---
import { TextSection } from '@components/odyssey-theme';
import Layout from '../../layouts/Page.astro';

const seo = {
	title: 'About | Saffron Shark Labs',
	description: 'About Saffron Shark Labs',
};
---

<Layout {seo}>
	<TextSection narrow>
		<h1>About Saffron Shark Labs</h1>
	</TextSection>
</Layout>
```

Rules:

- **Declare `seo` as a const in frontmatter** and pass it as `<Layout {seo}>`. Don't inline the object into the tag.
- **`title` is `Page Name | Saffron Shark Labs`**, except the home page, which is just `Saffron Shark Labs`. `description` is a real sentence about the page, not boilerplate repeated across pages.
- **Exactly one `<h1>` per page**, and it is the page's real heading.
- **Compose from section components**; a page's frontmatter should be imports and content data, not logic.
- **Page-specific CSS goes in a `<style>` block at the bottom of the page file**, after the markup.

## BaseHead

`src/components/head/BaseHead.astro` owns the entire `<head>`: charset, viewport, favicon, title, description, canonical URL, generator, Open Graph, and Twitter card tags. It also imports `src/styles/index.css` — the one place the stylesheet enters the site — and conditionally renders `ThemeProvider`.

- `title` and `description` fall back to `src/config/settings.js`.
- `canonicalURL` defaults to `new URL(Astro.url.pathname, Astro.site)`, where `Astro.site` comes from `astro.config.mjs`. Pass it explicitly only to point at a different canonical.
- `image` defaults to `/social.png` in `public/`. Pass a page-specific one for pages that deserve a distinct share card.

Meta tags belong in `BaseHead.astro`, not sprinkled into pages.

## Nav

Adding a page does not add it to the nav. Update `src/config/nav.js` for the header and `src/config/footer.js` for the footer lists — see `conventions/site-config-and-assets.md`.

## 404

`src/pages/404.astro` renders through `Page.astro` and is served by Netlify for unmatched paths. It keeps the site's voice ("Go Fish 🎣") and offers a route home. Preserve both if you touch it.
