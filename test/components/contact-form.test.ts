import { beforeAll, describe, expect, it } from 'vitest';
import ContactForm from '../../src/components/forms/ContactForm.astro';
import { render } from '../helpers/render';

const REAL_FIELDS = ['Name', 'Email', 'HowDidYouHearAboutUs', 'Message'];

let document: Document;

beforeAll(async () => {
	({ document } = (await render(ContactForm)) as { document: Document });
});

describe('ContactForm', () => {
	it('posts to the form backend', () => {
		const form = document.querySelector('form');
		expect(form?.getAttribute('method')).toBe('POST');
		expect(form?.getAttribute('action')).toMatch(
			/^https:\/\/www\.formbackend\.com\/f\//,
		);
	});

	it('sends the field names the form backend records', () => {
		for (const field of REAL_FIELDS) {
			expect(document.querySelector(`[name="${field}"]`)).not.toBeNull();
		}
	});

	it('labels every real field', () => {
		for (const field of REAL_FIELDS) {
			expect(document.querySelector(`label[for="${field}"]`)).not.toBeNull();
		}
	});

	/*
	 * The Username field is a spam honeypot, not a real field. It has to stay in
	 * the markup and stay hidden by CSS — hiding it with `type="hidden"` or the
	 * `hidden` attribute would let a bot skip it, which is the whole point.
	 */
	it('keeps the honeypot field in the markup', () => {
		expect(document.querySelector('[name="Username"]')).not.toBeNull();
	});

	it('hides the honeypot with CSS rather than a hidden input', () => {
		const honeypot = document.querySelector('[name="Username"]');
		expect(honeypot?.getAttribute('type')).toBe('text');
		expect(honeypot?.hasAttribute('hidden')).toBe(false);
	});

	it('has a submit button', () => {
		expect(document.querySelector('button')).not.toBeNull();
	});
});
