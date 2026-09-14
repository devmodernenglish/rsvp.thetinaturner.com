# Tina Turner — 87th Birthday · Cologne 2026

A single-page "save the date" landing site built with [Astro](https://astro.build).
Implements the Figma designs (desktop + mobile) for the Phase 1 landing page.

## Layout

- **Desktop (≥ 900px):** two columns. The left column scrolls (hero title →
  sign-up form → footer); the right column holds the concert photo, which is
  `position: sticky` so it stays fixed in view while the left column scrolls.
- **Mobile (< 900px):** single stacked column — compact title, inline photo,
  date band, heading, intro, form, footer.

## Form states

The three Figma frames are the three states of one form, handled client-side:

1. **Default** — fields with the light-blue underline.
2. **Active / validating** — focused field goes white; empty required fields turn
   red on submit and a summary error message appears.
3. **Success** — on a valid submit the form is replaced in place by the
   "Success!" panel.

> The form is **not** wired to a backend yet. Submitting only runs client-side
> validation and shows the success panel. The real submit will POST to a
> Cloudflare Worker that forwards into Klaviyo — see the `TODO: backend` marker
> in `src/components/SignupForm.astro`.

## Fonts

The brand faces are the licensed Adobe originals, loaded via an Adobe Fonts
(Typekit) kit in `src/layouts/Base.astro`:

| Role    | Face                           |
| ------- | ------------------------------ |
| Display | Acumin Pro ExtraCondensed Bold |
| Body    | Futura PT                      |

The kit loads non-render-blocking, so text paints in the fallback stack first
and swaps once the kit arrives (see `--font-display` / `--font-body` in
`src/styles/global.css`).

## Assets

Exported from Figma into `public/` (`svg/` for the title/logo/icons, `images/`
for the optimised hero photo). Photo credit: Paul Natkin.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to ./dist
npm run preview
```
