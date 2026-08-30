import { classicThemeIcon, darkThemeIcon } from './icons';

type ThemeOption = {
	/** Value written to `data-theme` and to localStorage. */
	name: string;
	/** Preview SVG, authored in ./icons.ts. */
	icon: string;
	label: string;
};

const themes: ThemeOption[] = [
	{ name: 'default', icon: classicThemeIcon, label: 'Light' },
	{ name: 'dark', icon: darkThemeIcon, label: 'Dark' },
];

/*
 * Scoped to the shadow root. The site's custom properties pierce shadow DOM,
 * so the switcher stays on-theme without importing any stylesheet.
 */
const styles = `
	:host {
		display: block;
	}
	.theme-switcher__container {
		margin: 1rem 0;
		display: flex;
		gap: 1rem;
	}
	.theme-select__container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	.theme-select__container p {
		margin: 0.25rem 0 0 0;
		font-size: var(--font-size-sm);
	}
	button {
		display: inline-flex;
		padding: 1px;
		background-color: transparent;
		border: 2px solid transparent;
		border-radius: 20rem;
		outline: none;
		cursor: pointer;
		transition: border var(--theme-transition);
	}
	button:hover,
	button:focus-visible {
		border-color: var(--theme-primary);
	}
	button[active] {
		border-color: var(--theme-primary);
		box-shadow: 0 0 12px 1px var(--theme-primary);
	}
`;

/**
 * Theme picker for the footer.
 *
 * Was a Lit component; Lit cost ~24kB of runtime to render two buttons, and
 * @astrojs/lit has not been published since June 2024. This is a plain custom
 * element with no dependencies.
 */
export class ThemeSwitcher extends HTMLElement {
	#buttons = new Map<string, HTMLButtonElement>();

	connectedCallback() {
		if (!this.shadowRoot) this.#render();
		this.#setTheme(this.#preferredTheme());
	}

	/** A stored choice wins; otherwise follow the operating system preference. */
	#preferredTheme() {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme !== null) return storedTheme;

		return window.matchMedia?.('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'default';
	}

	#render() {
		const root = this.attachShadow({ mode: 'open' });

		const style = document.createElement('style');
		style.textContent = styles;

		const container = document.createElement('div');
		container.className = 'theme-switcher__container';

		for (const theme of themes) {
			const button = document.createElement('button');
			button.type = 'button';
			button.title = `Enable ${theme.label} Theme`;
			// Build-time constant markup from ./icons.ts, never user input.
			button.innerHTML = theme.icon;
			button.addEventListener('click', () => this.#setTheme(theme.name));

			const label = document.createElement('p');
			label.textContent = theme.label;

			const wrapper = document.createElement('div');
			wrapper.className = 'theme-select__container';
			wrapper.append(button, label);

			container.append(wrapper);
			this.#buttons.set(theme.name, button);
		}

		root.append(style, container);
	}

	#setTheme(theme: string) {
		document.firstElementChild?.setAttribute('data-theme', theme);
		this.#setHeroImage(theme);
		localStorage.setItem('theme', theme);

		for (const [name, button] of this.#buttons) {
			const active = name === theme;
			button.toggleAttribute('active', active);
			button.setAttribute('aria-pressed', String(active));
		}
	}

	/*
	 * The home page swaps its hero to match the theme. The image URLs are hashed
	 * at build time by astro:assets, so the page hands them over on a data
	 * attribute rather than this file hardcoding paths it cannot know.
	 *
	 * Every other page has no #home-hero-image, so this must tolerate the element
	 * being absent — without the guard, setting a theme throws before it can
	 * persist the choice.
	 */
	#setHeroImage(theme: string) {
		const heroImage =
			document.querySelector<HTMLImageElement>('#home-hero-image');
		if (!heroImage?.dataset.themeVariants) return;

		let variants: Record<string, { src: string; alt: string }>;
		try {
			variants = JSON.parse(heroImage.dataset.themeVariants);
		} catch {
			return;
		}

		const variant = variants[theme];
		if (!variant) return;

		heroImage.src = variant.src;
		heroImage.alt = variant.alt;
	}
}

if (!customElements.get('theme-switcher')) {
	customElements.define('theme-switcher', ThemeSwitcher);
}
