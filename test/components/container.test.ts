import { describe, expect, it } from 'vitest';
import Container from '../../src/components/core/Container.astro';
import { classesOf, render } from '../helpers/render';

describe('Container', () => {
	it('emits a clean class list with no empty entries', async () => {
		const { document } = await render(Container, { slots: { default: 'x' } });
		expect(classesOf(document.querySelector('div'))).toEqual([
			'content__container',
		]);
	});

	it('adds the narrow modifier', async () => {
		const { document } = await render(Container, {
			props: { narrow: true },
			slots: { default: 'x' },
		});
		expect(classesOf(document.querySelector('div'))).toEqual([
			'content__container',
			'content__container--narrow',
		]);
	});

	it('renders its children', async () => {
		const { document } = await render(Container, {
			slots: { default: 'hello' },
		});
		expect(document.querySelector('div')?.textContent?.trim()).toBe('hello');
	});
});
