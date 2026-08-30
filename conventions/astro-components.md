# Astro Components

How components are written and wired together in `src/components/`.

## Where a component goes

| Kind                                        | Location                        |
| ------------------------------------------- | ------------------------------- |
| Site chrome (header, footer, container)      | `src/components/core/`          |
| A full-width block a page composes           | `src/components/sections/`      |
| A hero variant                               | `src/components/sections/heros/`|
| A single form control                        | `src/components/form-fields/`   |
| An assembled form                            | `src/components/forms/`         |
| A card                                       | `src/components/cards/`         |
| A button                                     | `src/components/buttons/`       |
| Anything genuinely one-off and site-specific | `src/components/` root (`Logo.astro`) |

Prefer adding a variant prop to an existing section over creating a near-duplicate file. The repo already carries unused theme components; don't grow that pile.

## The barrel export

`src/components/odyssey-theme.js` re-exports the shared theme components:

```js
export { default as Container } from './core/Container.astro';
```

- If a component is in the barrel, import it from `@components/odyssey-theme`.
- If it is not (the hero sections, `ContactForm`, `Logo`, `BaseHead`, `Nav`), import it by relative path — that is how `index.astro` and `about.astro` already do it.
- Add a component to the barrel only when it is reusable site chrome. Page-specific and site-specific components stay out of it.

## Frontmatter

Destructure props on one line at the top, with defaults inline:

```astro
---
const { type = 'text', autocomplete, id, label, name, placeholder, required } = Astro.props;
---
```

`export interface Props` is used in `Base.astro`, `Page.astro`, and `BaseHead.astro` — the files where the prop shape actually matters to callers. Most components skip it. Adding one to a component you are already reworking is welcome; converting untouched files is not.

## Slots over string props

Content goes in through slots so pages can put real markup there. Named slots for structured layouts, a default slot for the body:

```astro
<div class="text-and-image__text">
  <slot name="text-container" />
  <div class="text-and-image__btns">
    <slot name="btns-container" />
  </div>
</div>
```

A page then fills them:

```astro
<TextAndImageHero reversed>
  <div slot="text-container">
    <h1>Saffron Shark Labs</h1>
  </div>
  <picture slot="image-container">…</picture>
</TextAndImageHero>
```

Give a slot a fallback child when an empty slot would look broken.

## Boolean variant props

Variants are bare boolean attributes mapped onto a modifier class, using the `block__element--modifier` naming already in use:

```astro
---
const { narrow, left } = Astro.props;
---
<div class={`content__container ${narrow ? `content__container--narrow` : ``}`}>
```

`Button.astro` uses the shorter `${outlined && 'btn--outlined'}` form. Both exist; match the file. Note that the `&&` form writes the literal string `false` into the class list when the prop is absent — harmless, but prefer the ternary in new code.

## Polymorphic tags

`Button.astro` renders an `<a>` when given `href` and a `<button>` otherwise:

```astro
const Tag = href ? 'a' : 'button';
```

Reuse that pattern rather than adding a separate link component. When `newTab` is set, `rel="noopener noreferrer"` goes on with it — always.

## Client-side JavaScript

Pages ship no JS by default. There are exactly three places it exists, and each is a deliberate choice:

- `Header.astro` — an inline `<script type="module">` for the mobile menu toggle, which also locks body scroll while the menu is open.
- `ThemeProvider.astro` — an `is:inline` script that reads `localStorage.theme` and sets `data-theme` on the document element. It must stay inline and un-bundled so it runs before first paint; otherwise the page flashes the wrong theme.
- `theme-switcher.ts` — a Lit custom element, the one component that needs real reactivity.

Anything new that needs JS should follow the same rule: inline script in the component that owns it, and only if plain CSS cannot do the job (hover, focus, `:target`, and `details/summary` usually can).

## Accessibility

Existing behavior to preserve when editing these areas:

- `SkipLink` is the first element in `<body>` and targets `#content` on `<main>`. Keep both ends intact.
- Every `<img>` has a descriptive `alt`. The logo, hero, and about images all do.
- The menu button carries a `title` that flips between "Open Main Menu" and "Close Main Menu".
- Form controls are paired with a `<label for>` matching the input's `id`.
