# Testing

Vitest, configured in `vitest.config.mts` via Astro's `getViteConfig` so tests resolve `@components/*` aliases and compile `.astro` files exactly as the build does.

The config must stay `.mts`. Vitest loads a `.ts` config through esbuild's CJS path, and `astro/config` is ESM-only.

## The three suites

| Path               | What it covers                            | Command              |
| ------------------ | ----------------------------------------- | -------------------- |
| `test/unit/`       | Plain functions and config modules        | `npm test`           |
| `test/components/` | `.astro` components rendered in isolation | `npm test`           |
| `test/build/`      | The real built site in `dist/`            | `npm run test:build` |

`npm test` runs the first two and needs no build, so it stays fast. `test/build` reads `dist/` and therefore requires `npm run build` first — which is why CI orders it after the build step and why it is not part of `npm test`.

## Component tests

Use the Astro Container API through the `render` helper in `test/helpers/render.ts`, which returns a parsed document:

```ts
import { classesOf, render } from '../helpers/render';

const { document } = await render(Button, {
	props: { outlined: true },
	slots: { default: 'Go' },
});
expect(classesOf(document.querySelector('button'))).toEqual([
	'btn',
	'btn--outlined',
]);
```

**Assert on the DOM, not on the HTML string.** The container injects `data-astro-source-file` attributes in dev mode and does not promise attribute order, so `expect(html).toContain('<label for="Email">Email</label>')` is a test that breaks for reasons that are not bugs. `render` also returns `html` for the rare case where you need the raw string.

Slots take text, not markup — a slot string is escaped, so assert on the parent's `textContent` rather than querying for a tag you passed in.

## What is worth a test here

This is a static marketing site; there is no business logic to cover. Tests earn their place when they pin down something that has already gone wrong or that fails silently:

- **A regression you just fixed.** Every fix in `test/components/button.test.ts` traces to a real defect — the class list that shipped `undefined`, the empty `target=""`. Leave the comment explaining what broke.
- **A convention a reader would otherwise "clean up".** The honeypot tests in `test/components/contact-form.test.ts` exist so that deleting the hidden `Username` field fails CI instead of quietly restoring the spam problem.
- **Things that fail invisibly in a static build.** A missing `alt`, a dropped canonical tag, a nav link to a route that no longer exists, an unresolved template expression in an attribute. None of these break the build; all of them are covered in `test/build/output.test.ts`.

Adding a page means the page shows up in `test/build/output.test.ts`'s `PAGES` map and in the route list in `test/unit/config.test.js`. Both fail loudly if a nav or footer entry points somewhere that was never built.

Do not write tests that restate the CSS or assert the exact copy on a page — they cost more to maintain than the bugs they would catch.
