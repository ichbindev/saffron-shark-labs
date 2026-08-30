import { describe, expect, it } from 'vitest';
import FormInput from '../../src/components/form-fields/FormInput.astro';
import FormSelect from '../../src/components/form-fields/FormSelect.astro';
import FormTextarea from '../../src/components/form-fields/FormTextarea.astro';
import { render } from '../helpers/render';

describe('FormInput', () => {
	it('binds the label to the input via for/id', async () => {
		const { document } = await render(FormInput, {
			props: { id: 'Email', name: 'Email', label: 'Email', type: 'email' },
		});
		const label = document.querySelector('label');
		const input = document.querySelector('input');
		expect(label?.getAttribute('for')).toBe('Email');
		expect(label?.textContent).toBe('Email');
		expect(input?.getAttribute('id')).toBe('Email');
		expect(input?.getAttribute('name')).toBe('Email');
	});

	it('defaults to a text input', async () => {
		const { document } = await render(FormInput, {
			props: { id: 'Name', name: 'Name' },
		});
		expect(document.querySelector('input')?.getAttribute('type')).toBe('text');
	});

	it('omits the label element when no label is given', async () => {
		const { document } = await render(FormInput, {
			props: { id: 'Name', name: 'Name' },
		});
		expect(document.querySelector('label')).toBeNull();
	});

	it('passes autocomplete through', async () => {
		const { document } = await render(FormInput, {
			props: { id: 'Email', name: 'Email', autocomplete: 'email' },
		});
		expect(document.querySelector('input')?.getAttribute('autocomplete')).toBe(
			'email',
		);
	});
});

describe('FormSelect', () => {
	it('renders an empty-valued placeholder so the :valid color rule works', async () => {
		const { document } = await render(FormSelect, {
			props: {
				id: 'Source',
				name: 'Source',
				label: 'Source',
				options: ['Google Search'],
			},
		});
		const placeholder = document.querySelector('option');
		expect(placeholder?.getAttribute('value')).toBe('');
		expect(placeholder?.hasAttribute('disabled')).toBe(true);
	});

	it('renders one option per entry, plus the placeholder', async () => {
		const { document } = await render(FormSelect, {
			props: { id: 'Source', name: 'Source', options: ['A', 'B', 'C'] },
		});
		const values = [...document.querySelectorAll('option')].map(o =>
			o.getAttribute('value'),
		);
		expect(values).toEqual(['', 'A', 'B', 'C']);
	});

	it('does not fall over when given no options', async () => {
		const { document } = await render(FormSelect, {
			props: { id: 'S', name: 'S' },
		});
		expect(document.querySelectorAll('option')).toHaveLength(1);
	});
});

describe('FormTextarea', () => {
	it('defaults to four rows', async () => {
		const { document } = await render(FormTextarea, {
			props: { id: 'Message', name: 'Message', label: 'Message' },
		});
		expect(document.querySelector('textarea')?.getAttribute('rows')).toBe('4');
	});

	it('binds its label', async () => {
		const { document } = await render(FormTextarea, {
			props: { id: 'Message', name: 'Message', label: 'Message' },
		});
		expect(document.querySelector('label')?.getAttribute('for')).toBe(
			'Message',
		);
	});
});
