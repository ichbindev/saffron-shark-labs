import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { classicThemeIcon, darkThemeIcon } from './icons';

const themes = [
	{
		name: 'default',
		icon: classicThemeIcon,
		label: 'Light',
	},
	{
		name: 'dark',
		icon: darkThemeIcon,
		label: 'Dark',
	},
];

@customElement('theme-switcher')
export class ThemeSwitcher extends LitElement {
	static styles = [
		css`
			:host {
				display: block;
			}
			button {
				display: inline-flex;
				outline: none;
				border: none;
				background-color: transparent;
				border: 2px solid transparent;
				border-radius: 20rem;
				padding: 1px;
				cursor: pointer;
				transition: border var(--theme-transition);
			}
			button[active] {
				border: 2px solid var(--theme-primary);
				box-shadow: 0 0 12px 1px var(--theme-primary);
			}
			button:hover {
				border: 2px solid var(--theme-primary);
			}
			.theme-switcher__container {
				margin: 1rem 0;
				display: grid;
				grid-template-columns: repeat(5, 1fr);
			}
			.theme-select__container {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				justify-content: start;
			}
			.theme-select__container p {
				font-size: var(--font-size-sm);
			}
		`,
	];

	// set the _doc element
	private _doc = document.firstElementChild;

	@property({ type: String })
	theme: string | null = null;

	private _getCurrentTheme() {
		// A stored choice wins; otherwise follow the operating system preference.
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme !== null) {
			this._setTheme(storedTheme);
			return;
		}

		const prefersDark = window.matchMedia?.(
			'(prefers-color-scheme: dark)',
		).matches;
		this._setTheme(prefersDark ? 'dark' : 'default');
	}

	firstUpdated() {
		this._getCurrentTheme();
	}

	private _setTheme(theme: string) {
		this._doc.setAttribute('data-theme', theme);
		this._setHeroImage(theme);
		localStorage.setItem('theme', theme);
		this.theme = theme;
	}

	/*
	 * The home page swaps its hero to match the theme. The image URLs are hashed
	 * at build time by astro:assets, so the page hands them over on a data
	 * attribute rather than this file hardcoding paths it cannot know.
	 *
	 * Every other page has no #home-hero-image, so this must tolerate the element
	 * being absent — without the guard, _setTheme throws before it can persist
	 * the choice.
	 */
	private _setHeroImage(theme: string) {
		const heroImage = document.querySelector(
			'#home-hero-image',
		) as HTMLImageElement | null;
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

	render() {
		const themeButtons = html`${themes.map(theme => {
			return html`
				<div class="theme-select__container">
					<button
						@click=${() => this._setTheme(theme.name)}
						?active=${this.theme === theme.name}
						title=${`Enable ${theme.label} Theme`}
					>
						${theme.icon}
					</button>
					<p>${theme.label}</p>
				</div>
			`;
		})}`;

		return html` <div class="theme-switcher__container">${themeButtons}</div> `;
	}
}
