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

| Family      | Tokens                                                                                                                                                                                      |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color       | `--theme-primary`, `--theme-primary-hover`, `--theme-on-primary`, `--theme-bg`, `--theme-on-bg`, `--theme-surface-1` / `--theme-on-surface-1`, `--theme-surface-2` / `--theme-on-surface-2` |
| Shape       | `--theme-shape-radius`, `--theme-button-border-radius`                                                                                                                                      |
| Motion      | `--theme-transition`                                                                                                                                                                        |
| Layout      | `--section-margin`, `--theme-grid-gap`, `--container-max-width`, `--container-max-width-narrow`, `--container-padding`, `--navbar-height`                                                   |
| Form field  | `--form-field-border-color`, `--form-field-border-focus-color`, `--form-field-border-radius`, `--form-field-input-color`                                                                    |
| Font family | `--theme-font-family-serif`, `--theme-font-family-sans`                                                                                                                                     |
| Font size   | `--font-size-sm` … `--font-size-xxxl` (in `typography.css`)                                                                                                                                 |

**Surface and on-surface travel together.** Setting a background without its paired `--theme-on-*` color is the most common way to produce unreadable text in one of the themes. `contact.astro` and `Page.astro`'s `<Footer>` both set the pair.

Form fields keep their literal fallbacks — `var(--form-field-border-color, #ccc)` and friends — but the tokens are now defined in `:root`, so fields follow the theme instead of being permanently grey-bordered with a black focus ring in every theme. Leave the fallbacks in; they are what keeps the field components usable on their own.

`--navbar-height` is the height of the site header, which the heroes and the contact page subtract from `100vh`. It must stay defined: a `calc()` that references an undefined custom property makes the entire declaration invalid, which is how every hero on the site silently lost its `min-height`.

## Themes

`theme.css` defines `:root` plus two `[data-theme]` blocks, `default` and `dark`, matching the two entries in the `themes` array in `src/components/theme-switcher/theme-switcher.ts`.

**`:root` holds every token and doubles as the light palette.** Each `[data-theme]` block overrides colors only — repeating the layout, shape, motion or font tokens there is duplication that will drift. A page has to render correctly from `:root` alone, because that is what a visitor with JS disabled gets.

Theme selection happens in two places that must agree:

- `ThemeProvider.astro` — an inline, render-blocking script that reads `localStorage.theme`, falls back to `prefers-color-scheme`, and sets `data-theme` before first paint.
- `theme-switcher.ts` — the Lit element in the footer, which does the same on hydration and writes the user's choice back to `localStorage`.

Change the fallback logic in one and you must change it in the other. They diverged once, and the result was a visible flash: the page painted the `:root` palette, then snapped to a different one when the footer hydrated.

Adding a theme means a `[data-theme]` block, an entry in `themes`, and — only if it needs its own hero art — an entry in the `heroImages` map. A theme with no `heroImages` entry leaves the hero image alone, which is the right default.

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
.text-and-image__image :global(img) {
	object-fit: cover;
}
.custom-icon__span :global(svg) {
	width: 24px;
}
```

Always anchor `:global()` inside a scoped selector, as above. A bare top-level `:global(...)` leaks site-wide — `ContactForm.astro` uses one deliberately to hide the honeypot field, and that is the only place it belongs.

## Layout

- Wrap page content in `<Container>`; use `narrow` for prose-width pages. Do not hand-roll a max-width wrapper.
- Sections space themselves with `margin: var(--section-margin) auto`.
- CSS Grid for two-column layouts, flexbox for one-dimensional alignment.
- Vertical rhythm comes from `--section-margin` and the `margin: 0 0 1rem 0` that `typography.css` puts on headings and paragraphs.

## Responsive

Mobile-first is _not_ the convention here — the base rules are desktop and `max-width` media queries collapse them. Two breakpoints are in use, and there should not be a third:

- `768px` — grid layouts collapse to a single column (`contact.astro`, `TextAndImageHero.astro`)
- `600px` — the header switches to the mobile menu (`Header.astro`)

Font sizes are fluid via `clamp()` and need no breakpoint.
