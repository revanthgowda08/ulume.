# Assets

- `icon.png`, `splash.png`, `adaptive-icon.png` — currently simple placeholder images
  (dark green background, amber "U"/"ULUME" wordmark) so the app has something valid
  to build with. Swap these for real designs whenever you have branded artwork —
  same filenames, `icon.png`/`adaptive-icon.png` should stay 1024x1024.
- `fonts/NotoSansKannada-Regular.ttf` / `fonts/NotoSansKannada-Bold.ttf` — not yet
  added (need downloading from Google Fonts). `App.js` falls back to the system font
  without them, but Kannada text should use Noto Sans Kannada in production for
  correct rendering.

Firebase Android config lives at the project root as `google-services.json` (already
present — see README.md for how it was obtained).

`App.js` will still run without the fonts present (it falls back to the system font),
but Kannada text should use Noto Sans Kannada in production for correct rendering.
