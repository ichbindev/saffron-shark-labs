import { describe, expect, it } from 'vitest';
import Button from '../../src/components/buttons/Button.astro';
import { classesOf, render } from '../helpers/render';

describe('Button', () => {
	it('renders a button element when given no href', async () => {
		const { document } = await render(Button, { slots: { default: 'Submit' } });
		expect(document.querySelector('button')).not.toBeNull();
		expect(document.querySelector('a')).toBeNull();
	});

	it('renders an anchor when given an href', async () => {
		const { document } = await render(Button, {
			props: { href: '/company/contact' },
			slots: { default: 'Contact' },
		});
		const anchor = document.querySelector('a');
		expect(anchor).not.toBeNull();
		expect(anchor?.getAttribute('href')).toBe('/company/contact');
		expect(document.querySelector('button')).toBeNull();
	});

	// Regression: the class list was built with `${prop && 'cls'}` inside a
	// template literal, so every button on the site shipped as
	// class="btn undefined undefined undefined".
	it('emits only the btn class when given no modifiers', async () => {
		const { document } = await render(Button, { slots: { default: 'Go' } });
		expect(classesOf(document.querySelector('button'))).toEqual(['btn']);
	});

	it('adds only the modifier classes it was asked for', async () => {
		const { document } = await render(Button, {
			props: { outlined: true },
			slots: { default: 'Go' },
		});
		expect(classesOf(document.querySelector('button'))).toEqual([
			'btn',
			'btn--outlined',
		]);
	});

	it('omits target and rel entirely unless newTab is set', async () => {
		const { document } = await render(Button, {
			props: { href: '/' },
			slots: { default: 'Home' },
		});
		const anchor = document.querySelector('a');
		expect(anchor?.hasAttribute('target')).toBe(false);
		expect(anchor?.hasAttribute('rel')).toBe(false);
	});

	it('pairs target=_blank with rel=noopener noreferrer', async () => {
		const { document } = await render(Button, {
			props: { href: 'https://example.com', newTab: true },
			slots: { default: 'External' },
		});
		const anchor = document.querySelector('a');
		expect(anchor?.getAttribute('target')).toBe('_blank');
		expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
	});

	it('renders its slotted label', async () => {
		const { document } = await render(Button, { slots: { default: 'Submit' } });
		expect(document.querySelector('button')?.textContent?.trim()).toBe(
			'Submit',
		);
	});
});
