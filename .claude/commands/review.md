# Local Code Review Request

Review the pending changes in this repository as an experienced **front-end engineer who ships small static marketing sites** and cares about accessibility, page weight, and not letting a five-page site accumulate the machinery of an application.

## Context

This is a static Astro 4 marketing site built on the Odyssey theme. Plain CSS with custom-property theming, no framework, no backend, no tests. Read `AGENTS.md` and the relevant files in `conventions/` before reviewing — the conventions there are derived from this codebase and are what the change should be measured against.

## Preparation

```bash
git status
git fetch origin
git diff --unified=5 --ignore-all-space origin/main...HEAD
```

If the branch has no upstream, review the working tree against `HEAD` instead.

## What to look for

Weight these to the change actually in front of you; skip what does not apply.

- **Theming.** Any hard-coded color, radius, or font stack that should be a token from `src/styles/theme.css`. Any background set without its paired `--theme-on-*` color. Anything that will read wrong in the dark theme — check both.
- **Scope creep in CSS.** Rules added to `src/styles/` that only one page needs. Bare top-level `:global()` selectors leaking out of a component (the honeypot in `ContactForm.astro` is the one sanctioned exception).
- **Dependency and JS creep.** A new package, a client-side framework, or a `<script>` where CSS or a static attribute would do. Pages ship zero JS by default and that is a feature.
- **Accessibility.** Missing or lazy `alt` text, an `<img>` without one, a form control without a matching `<label for>`, a second `<h1>`, heading levels skipped, the `SkipLink` → `#content` pair broken, an interactive control that lost its `title` or focus style.
- **SEO and head.** A page missing its `seo` const, a title that breaks the `Page Name | Saffron Shark Labs` pattern, a boilerplate description copied from another page, meta tags added to a page instead of `BaseHead.astro`.
- **Page weight.** Uncompressed or oversized images committed to `public/assets/`. A new font weight without both `.woff2` and `.woff`.
- **Forms.** Anything that removes, un-hides, or renames the `Username` honeypot field, or renames a field `name` that the form backend records.
- **Conventions drift.** Components importing config directly instead of receiving props. A near-duplicate section component where a variant prop would do. Wholesale reformatting that buries the real diff. Commented-out markup left behind. A `<style>` block before the markup instead of after it.
- **Silently invalid CSS.** A `calc()` referencing an undefined custom property (which voids the whole declaration), a color assigned to a non-color property, a duplicated selector where the second copy wins, a modifier class with no rule behind it.
- **Class and attribute construction.** `${prop && 'cls'}` inside a template literal ships the text `undefined`; a ternary ships stray whitespace. Both should be a filtered array joined in the frontmatter. Optional attributes should be `undefined`, not `''`.
- **Test coverage.** A fixed bug with no regression test. A new page missing from the `PAGES` map in `test/build/output.test.ts` or the route list in `test/unit/config.test.js`.
- **Correctness.** Broken imports, a component used with props it does not accept, a nav or footer entry pointing at a route that does not exist, a new page not added to `src/config/nav.js` when it should be.

Confirm the change passes: `npm run check`, then `npm run build && npm run test:build`.

## Output

Report findings inline in your response, most important first, each with the file and line and a concrete description of what goes wrong. Be direct and technical. Do not add a section for every category just to be complete, and do not pad with praise — only report what you actually found. If the change is clean, say so in a sentence.
