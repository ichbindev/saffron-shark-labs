import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { parseHTML } from 'linkedom';

/*
 * Renders an .astro component and hands back a queryable document.
 *
 * Asserting on parsed DOM rather than on the HTML string keeps these tests off
 * attribute order and off the data-astro-source-* attributes the container adds
 * in dev mode.
 */
export async function render(
	Component: unknown,
	options: Record<string, unknown> = {},
) {
	const container = await AstroContainer.create();
	const html = await container.renderToString(
		Component as never,
		options as never,
	);
	const { document } = parseHTML(`<body>${html}</body>`);
	return { html, document };
}

/** The class list of the rendered root element, sorted for stable comparison. */
export function classesOf(element: Element | null) {
	return [...(element?.classList ?? [])].sort();
}
