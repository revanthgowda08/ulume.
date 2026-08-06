# Assets

- `icon.png`, `splash.png`, `adaptive-icon.png` — currently simple placeholder images
  (dark green background, amber "U"/"ULUME" wordmark) so the app has something valid
  to build with. Swap these for real designs whenever you have branded artwork —
  same filenames, `icon.png`/`adaptive-icon.png` should stay 1024x1024.
- `fonts/NotoSansKannada-Regular.ttf` / `fonts/NotoSansKannada-Bold.ttf` — real static
  weight instances extracted from Google's Noto Sans Kannada variable font
  (github.com/google/fonts, SIL Open Font License). `App.js` statically `require()`s
  these two exact paths, so they must exist for the JS bundle to build at all — this
  was the actual cause of the app crashing immediately on launch (the files were
  referenced but never created, so the release bundle shipped with a broken asset
  reference and failed at startup).

Firebase Android config lives at the project root as `google-services.json` (already
present — see README.md for how it was obtained).

