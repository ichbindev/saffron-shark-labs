import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parseHTML } from 'linkedom';
import { beforeAll, describe, expect, it } from 'vitest';

/*
 * Checks against the real built site in dist/. Run `npm run build` first;
 * `npm run test:build` is kept out of `npm test` so the fast suite stays fast.
 *
 * These are the regressions a component test cannot see: a page that lost its
 * canonical tag, an image that lost its alt, a nav link pointing at a route
 * that no longer exists, an unresolved template expression in an attribute.
 */

const DIST = join(process.cwd(), 'dist');

const PAGES = {
	'/': 'index.html',
	'/company/about': 'company/about/index.html',
	'/company/contact': 'company/contact/index.html',
	'/404': '404.html',
} as const;

type PageName = keyof typeof PAGES;

const documents = {} as Record<PageName, Document>;

beforeAll(() => {
	if (!existsSync(DIST)) {
		throw new Error(
			'dist/ not found — run `npm run build` before `npm run test:build`.',
		);
	}
	for (const [name, file] of Object.entries(PAGES)) {
		const html = readFileSync(join(DIST, file), 'utf8');
		documents[name as PageName] = parseHTML(html)
			.document as unknown as Document;
	}
});

const eachPage = Object.keys(PAGES) as PageName[];

describe.each(eachPage)('%s', page => {
	it('has a non-empty title', () => {
		const title = documents[page].querySelector('title')?.textContent?.trim();
		expect(title).toBeTruthy();
	});

	it('has a meta description', () => {
		const description = documents[page]
			.querySelector('meta[name="description"]')
			?.getAttribute('content');
		expect(description?.trim()).toBeTruthy();
	});

	it('has a canonical link on the production domain', () => {
		const canonical = documents[page]
			.querySelector('link[rel="canonical"]')
			?.getAttribute('href');
		expect(canonical).toMatch(/^https:\/\/saffronsharklabs\.com\//);
	});

	it('has Open Graph and Twitter card tags', () => {
		for (const selector of [
			'meta[property="og:title"]',
			'meta[property="og:description"]',
			'meta[property="og:image"]',
			'meta[property="twitter:card"]',
			'meta[property="twitter:image"]',
		]) {
			expect(
				documents[page].querySelector(selector)?.getAttribute('content'),
			).toBeTruthy();
		}
	});

	it('has exactly one h1', () => {
		expect(documents[page].querySelectorAll('h1')).toHaveLength(1);
	});

	it('does not skip from h1 to h3', () => {
		const levels = [
			...documents[page].querySelectorAll('h1, h2, h3, h4, h5, h6'),
		].map(h => Number(h.tagName[1]));
		for (let i = 1; i < levels.length; i++) {
			expect(levels[i] - levels[i - 1]).toBeLessThanOrEqual(1);
		}
	});

	it('gives every image alt text', () => {
		for (const img of documents[page].querySelectorAll('img')) {
			expect(
				img.getAttribute('alt')?.trim(),
				img.getAttribute('src') ?? '',
			).toBeTruthy();
		}
	});

	// Regression: `class={`btn ${prop && 'x'}`}` shipped "undefined" to production.
	it('has no unresolved template expressions in class attributes', () => {
		for (const el of documents[page].querySelectorAll('[class]')) {
			const value = el.getAttribute('class') ?? '';
			expect(value.split(/\s+/), value).not.toContain('undefined');
			expect(value.split(/\s+/), value).not.toContain('false');
		}
	});

	it('opens external links safely', () => {
		for (const anchor of documents[page].querySelectorAll(
			'a[target="_blank"]',
		)) {
			expect(
				anchor.getAttribute('rel'),
				anchor.getAttribute('href') ?? '',
			).toContain('noopener');
		}
	});

	it('starts with a skip link pointing at the main landmark', () => {
		const doc = documents[page];
		expect(doc.querySelector('a[href="#content"]')).not.toBeNull();
		expect(doc.querySelector('main#content')).not.toBeNull();
	});

	it('sets the document language', () => {
		expect(documents[page].querySelector('html')?.getAttribute('lang')).toBe(
			'en',
		);
	});

	it('resolves every internal link to a page that was built', () => {
		const internal = [...documents[page].querySelectorAll('a[href^="/"]')]
			.map(a => a.getAttribute('href') ?? '')
			.filter(href => !href.startsWith('//'));

		for (const href of internal) {
			const path = href.replace(/\/$/, '') || '/';
			const candidates = [
				join(DIST, path === '/' ? 'index.html' : `${path.slice(1)}/index.html`),
				join(DIST, path.slice(1)),
			];
			expect(
				candidates.some(existsSync),
				`${page} links to ${href}, which was not built`,
			).toBe(true);
		}
	});
});

describe('site output', () => {
	// @astrojs/sitemap v3 emits an index plus numbered files, where v0.1 emitted a
	// single sitemap.xml. netlify.toml redirects the old URL to the new index.
	it('emits a sitemap index pointing at a sitemap that lists the public pages', () => {
		const index = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8');
		expect(index).toContain('https://saffronsharklabs.com/sitemap-0.xml');

		const sitemap = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
		for (const path of ['/', '/company/about/', '/company/contact/']) {
			expect(sitemap).toContain(`https://saffronsharklabs.com${path}`);
		}
	});

	it('keeps the 404 page out of the sitemap', () => {
		expect(readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8')).not.toContain(
			'/404',
		);
	});

	/*
	 * Every content image goes through astro:assets, which re-encodes it at build
	 * time — the four originals were 3.7MB of jpeg/png and come out as 347kB of
	 * webp. An image dropped into public/ and referenced by path skips all of
	 * that, so fail if one shows up.
	 */
	it('serves every content image as a build-optimized asset', () => {
		for (const page of eachPage) {
			for (const img of documents[page].querySelectorAll('img')) {
				const src = img.getAttribute('src') ?? '';
				expect(src, `${page} → ${src}`).toMatch(/^\/_astro\//);
				expect(src, `${page} → ${src}`).toMatch(/\.(webp|avif)$/);
			}
		}
	});

	it('gives every image intrinsic dimensions so the layout cannot shift', () => {
		for (const page of eachPage) {
			for (const img of documents[page].querySelectorAll('img')) {
				const src = img.getAttribute('src') ?? '';
				expect(Number(img.getAttribute('width')), src).toBeGreaterThan(0);
				expect(Number(img.getAttribute('height')), src).toBeGreaterThan(0);
			}
		}
	});

	// The hashed asset URLs are unknowable to theme-switcher.ts, so index.astro
	// hands them over on a data attribute. Both themes must be present.
	it('hands the theme switcher both hero variants', () => {
		const hero = documents['/'].querySelector('#home-hero-image');
		const variants = JSON.parse(
			hero?.getAttribute('data-theme-variants') ?? '{}',
		);
		expect(Object.keys(variants).sort()).toEqual(['dark', 'default']);
		for (const variant of Object.values(variants) as {
			src: string;
			alt: string;
		}[]) {
			expect(variant.alt.trim()).toBeTruthy();
			expect(existsSync(join(DIST, variant.src.slice(1))), variant.src).toBe(
				true,
			);
		}
	});

	it('ships the theme script inline so the theme cannot flash', () => {
		const html = readFileSync(join(DIST, 'index.html'), 'utf8');
		expect(html).toContain("localStorage.getItem('theme')");
	});

	/*
	 * The theme switcher is a plain custom element. It was a Lit component, which
	 * cost ~29kB of framework runtime across four requests to render two buttons.
	 * Nothing on this site should reintroduce a client framework.
	 */
	it('ships no framework runtime', () => {
		const bundled = readdirSync(join(DIST, '_astro'), { recursive: true })
			.map(String)
			.filter(file => file.endsWith('.js'));
		expect(bundled).toEqual([]);

		const html = readFileSync(join(DIST, 'index.html'), 'utf8');
		for (const marker of ['lit-html', 'astro-island', 'client:only']) {
			expect(html, marker).not.toContain(marker);
		}
	});

	it('renders the theme switcher on every page, since it lives in the footer', () => {
		for (const page of eachPage) {
			expect(
				documents[page].querySelector('theme-switcher'),
				page,
			).not.toBeNull();
		}
	});

	it('keeps the contact honeypot in the built page', () => {
		expect(
			documents['/company/contact'].querySelector('[name="Username"]'),
		).not.toBeNull();
	});

	it('references only font files that exist', () => {
		const css = readFileSync(join(DIST, 'index.html'), 'utf8');
		const fonts = [...css.matchAll(/\/assets\/fonts\/([\w.-]+\.woff2?)/g)].map(
			m => m[1],
		);
		for (const font of new Set(fonts)) {
			expect(existsSync(join(DIST, 'assets/fonts', font)), font).toBe(true);
		}
	});

	it('references only images that exist', () => {
		for (const [page, file] of Object.entries(PAGES)) {
			const doc = documents[page as PageName];
			for (const img of doc.querySelectorAll('img[src^="/"]')) {
				const src = img.getAttribute('src') ?? '';
				expect(existsSync(join(DIST, src.slice(1))), `${file} → ${src}`).toBe(
					true,
				);
			}
		}
	});
});
