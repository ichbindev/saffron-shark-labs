import { getViteConfig } from 'astro/config';

// getViteConfig gives the tests the same resolution Astro uses at build time:
// the `@components/*` aliases, `.astro` compilation, and the integrations.
export default getViteConfig({
	test: {
		globals: false,
		include: ['test/**/*.test.ts', 'test/**/*.test.js'],
	},
});
