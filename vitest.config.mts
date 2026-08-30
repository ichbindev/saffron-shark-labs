/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig gives the tests the same resolution Astro uses at build time:
// the `@components/*` aliases, `.astro` compilation, and the integrations.
//
// The cast is needed because getViteConfig is typed against Astro's own copy of
// Vite's UserConfig, which does not carry Vitest's `test` key.
export default getViteConfig({
	test: {
		globals: false,
		include: ['test/**/*.test.ts', 'test/**/*.test.js'],
	},
} as Parameters<typeof getViteConfig>[0]);
