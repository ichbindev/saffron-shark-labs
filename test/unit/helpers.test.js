import { describe, expect, it } from 'vitest';
import { generateSlug, generateTagData } from '../../src/utils/helpers.js';

describe('generateSlug', () => {
	it('lowercases and hyphenates whitespace', () => {
		expect(generateSlug('Remote Work')).toBe('remote-work');
	});

	it('trims surrounding whitespace rather than turning it into hyphens', () => {
		expect(generateSlug('  Hybrid Work  ')).toBe('hybrid-work');
	});

	it('collapses runs of whitespace into a single hyphen', () => {
		expect(generateSlug('a   b')).toBe('a-b');
	});

	it('strips characters that are not word characters or hyphens', () => {
		expect(generateSlug('Q&A: Sharks!')).toBe('qa-sharks');
	});

	it('collapses repeated hyphens', () => {
		expect(generateSlug('a -- b')).toBe('a-b');
	});

	it('does not leave a leading or trailing hyphen', () => {
		expect(generateSlug('-Odyssey Theme-')).toBe('odyssey-theme');
	});

	it('accepts non-string input', () => {
		expect(generateSlug(2025)).toBe('2025');
	});
});

describe('generateTagData', () => {
	it('pairs each category with its slug', () => {
		expect(generateTagData(['Remote Work', 'Odyssey Theme'])).toEqual([
			{ title: 'Remote Work', slug: 'remote-work' },
			{ title: 'Odyssey Theme', slug: 'odyssey-theme' },
		]);
	});

	it('returns an empty array for no categories', () => {
		expect(generateTagData([])).toEqual([]);
	});
});
