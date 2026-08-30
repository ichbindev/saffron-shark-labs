# Styling and Theming

Plain CSS only. No Tailwind, no preprocessor, no CSS-in-JS.

## Where CSS lives

`src/styles/index.css` is the single entry point, imported once by `BaseHead.astro`. It pulls in four files in a deliberate order:

1. `reset.css` — normalize
2. `theme.css` — design tokens (`:root` plus each `[data-theme='…']`)
3. `typography.css` — `@font-face`, the font-size scale, heading and `<p>` defaults
4. `global.css` — a handful of document-level rules (`body` max-width, background, `<pre>`)

Everything else belongs in the component's own `<style>` block, which Astro scopes automatically.

Add to `src/styles/` only when a rule genuinely applies everywhere. A rule that exists to make one page look right belongs on that page.

## Tokens, not literals

Never write a raw color, radius, or font stack in a component. Use the custom properties from `theme.css`:

```css
background-color: var(--theme-surface-1);
color: var(--theme-on-surface-1);
border-radius: var(--theme-shape-radius);
transition: background-color var(--theme-transition);
```

The token families:

| Family     | Tokens                                                                      |
| ---------- | --------------------------------------------------------------------------- |
| Color      | `--theme-primary`, `--theme-primary-hover`, `--theme-on-primary`, `--theme-bg`, `--theme-on-bg`, `--theme-surface-1` / `--theme-on-surface-1`, `--theme-surface-2` / `--theme-on-surface-2` |
| Shape      | `--theme-shape-radius`, `--theme-button-border-radius`                      |
| Motion     | `--theme-transition`                                                        |
| Layout     | `--section-margin`, `--theme-grid-gap`, `--container-max-width`, `--container-max-width-narrow`, `--container-padding` |
| Font family| `--theme-font-family-serif`, `--theme-font-family-sans`                     |
| Font size  | `--font-size-sm` … `--font-size-xxxl` (in `typography.css`)                 |

**Surface and on-surface travel together.** Setting a background without its paired `--theme-on-*` color is the most common way to produce unreadable text in one of the themes. `contact.astro` and `Page.astro`'s `<Footer>` both set the pair.

Form fields use their own tokens with literal fallbacks — `var(--form-field-border-color, #ccc)`, `var(--form-field-input-color, #000000)`, `var(--form-field-border-radius, 0.25rem)`, `var(--form-field-border-focus-color, #000)`. Only the dark theme overrides `--form-field-input-color`. If you touch form field colors, check both themes.

## Themes

`theme.css` defines `:root` plus five `[data-theme]` blocks: `default`, `dark`, `earth`, `ocean`, `sand`. Only `default` and `dark` are live — the other three are commented out of the `themes` array in `src/components/theme-switcher/theme-switcher.ts`. Leave the unused blocks alone unless you are deliberately re-enabling a theme, in which case uncomment the entry in that array too.

The switcher writes to `localStorage.theme`; `ThemeProvider.astro` reads it back and sets `data-theme` on `document.firstElementChild` before paint. `enableThemeSwitcher` in `src/config/settings.js` gates whether the provider renders at all.

**Check any visual change in both light and dark before calling it done.**

## Naming

BEM-ish, double-underscore for element and double-hyphen for modifier:

```
.content__container
.content__container--narrow
.text-and-image__section--reversed
.footer-socials__list
.btn--outlined
```

## Scoped styles and `:global()`

Astro scopes a component's styles to that component's own elements. Slotted content and child components are not covered, so styling them needs `:global()`:

```css
.text-and-image__image :global(img) { object-fit: cover; }
.custom-icon__span :global(svg) { width: 24px; }
```

Always anchor `:global()` inside a scoped selector, as above. A bare top-level `:global(...)` leaks site-wide — `ContactForm.astro` uses one deliberately to hide the honeypot field, and that is the only place it belongs.

## Layout

- Wrap page content in `<Container>`; use `narrow` for prose-width pages. Do not hand-roll a max-width wrapper.
- Sections space themselves with `margin: var(--section-margin) auto`.
- CSS Grid for two-column layouts, flexbox for one-dimensional alignment.
- Vertical rhythm comes from `--section-margin` and the `margin: 0 0 1rem 0` that `typography.css` puts on headings and paragraphs.

## Responsive

Mobile-first is *not* the convention here — the base rules are desktop and `max-width` media queries collapse them. Two breakpoints are in use, and there should not be a third:

- `768px` — grid layouts collapse to a single column (`contact.astro`, `TextAndImageHero.astro`)
- `600px` — the header switches to the mobile menu (`Header.astro`)

Font sizes are fluid via `clamp()` and need no breakpoint.
