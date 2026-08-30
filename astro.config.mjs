import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
	site: 'https://saffronsharklabs.com/', // Your public domain, e.g.: https://my-site.dev/. Used to generate sitemaps and canonical URLs.
	integrations: [sitemap(), mdx(), icon()],
});
