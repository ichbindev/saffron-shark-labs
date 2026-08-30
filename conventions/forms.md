# Forms

There is exactly one form on the site: `src/components/forms/ContactForm.astro`, rendered on `/company/contact`.

## How it submits

A plain HTML `POST` to a hosted [formbackend.com](https://www.formbackend.com) endpoint. There is no JavaScript, no fetch, no validation library, and no server of our own:

```astro
<form
	name="Contact Form"
	method="POST"
	action="https://www.formbackend.com/f/…"
>
</form>
```

Keep it that way. If a change seems to need client-side submission handling, the static-site premise is worth re-examining first.

## The honeypot — do not remove

The `Username` field is a spam trap, added deliberately after the form drew heavy bot submissions. It is a real, visible-to-crawlers input hidden from humans by CSS:

```astro
<FormInput
	type="text"
	label="Username"
	id="Username"
	name="Username"
	autocomplete="username"
	placeholder="JohnDoe69"
/>
```

```css
:global(label[for='Username']) {
	display: none;
}
:global(#Username) {
	display: none;
}
```

It looks like dead code and reads like an accidental leftover. It is neither. Three things must stay true:

- The field stays in the form and stays hidden.
- It is hidden with CSS in the component, not with `hidden` or `type="hidden"` — the point is that a bot filling every field walks into it.
- The two `:global()` selectors are the deliberate exception to the "no bare global selectors" rule in `conventions/styling-and-theming.md`. They are bare because the field's styles live on `FormInput`, not on `ContactForm`.

`test/components/contact-form.test.ts` asserts all three, so removing or un-hiding the field fails CI. Any new form gets the same treatment.

## Field components

`FormInput`, `FormSelect`, and `FormTextarea` in `src/components/form-fields/` are the only field primitives. Don't write a raw `<input>` in a form.

Each takes `label`, `name`, `id`, `placeholder`, and `required`; `FormInput` also takes `type` (default `text`) and `autocomplete`; `FormSelect` takes `options` as an array of strings. Pass `id` and `name` the same value — `id` is what the `<label for>` binds to and `name` is what reaches the form backend, and the fields are named in PascalCase (`Name`, `Email`, `HowDidYouHearAboutUs`, `Message`) because those names become the columns in the submission dashboard. Renaming one silently changes what the backend records.

Set `autocomplete` on anything a browser can reasonably fill.

`FormSelect` renders a `disabled selected value=""` placeholder option and relies on `:valid` to switch the text from gray to the real input color — which is why the empty option must keep `value=""`.

## Layout

The form is a single-column grid with a `1rem` gap. Fields stack; there are no side-by-side rows. `<Button>` with no `href` renders as the `<button>` submit.
