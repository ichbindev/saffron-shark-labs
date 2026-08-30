import { describe, expect, it } from 'vitest';
import settings from '../../src/config/settings.js';
import { nav } from '../../src/config/nav.js';
import { footerLists, footerSocials } from '../../src/config/footer.js';

const pages = ['/', '/company/about', '/company/contact'];

describe('settings', () => {
	it('has no trailing slash on url, which the comment in the file requires', () => {
		expect(settings.url.endsWith('/')).toBe(false);
	});

	it('exposes the fields BaseHead falls back to', () => {
		expect(settings.title).toBeTruthy();
		expect(settings.description).toBeTruthy();
		expect(settings.name).toBeTruthy();
	});
});

describe('nav', () => {
	it('points every entry at a page that exists', () => {
		for (const item of nav) {
			expect(pages).toContain(item.slug);
		}
	});

	it('gives every entry a title', () => {
		for (const item of nav) {
			expect(item.title).toBeTruthy();
		}
	});
});

describe('footer', () => {
	it('points every link at a page that exists', () => {
		for (const list of footerLists) {
			for (const item of list.items) {
				expect(pages).toContain(item.slug);
			}
		}
	});

	it('gives every social an absolute url and an iconify name', () => {
		for (const social of footerSocials) {
			expect(social.url).toMatch(/^https:\/\//);
			expect(social.icon).toMatch(/^(ic|mdi):/);
			expect(social.name).toBeTruthy();
		}
	});
});
