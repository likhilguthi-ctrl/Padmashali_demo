# Demo website assets

Replace an image in its existing folder to update artwork without changing its data record. Keep each title's English and Telugu files together under its own slug folder.

## Folder layout

- `brand/` — site logo, favicon, and shared icon sprite
- `placeholders/` — fallback avatar and poster
- `community-personalities/` — community profiles
- `music/` — songs and music features
- `podcasts/` — podcast artwork
- `education/` — education profiles and features
- `films-series/` — web films and series

## Artwork naming

Each title uses `en/` and `te/` language folders. Both contain the same three predictable filenames:

- `poster-2x3.png` — portrait poster
- `banner-16x9.png` — landscape artwork
- `title-logo-3x1.png` — transparent title logo

Example: `podcasts/kanta_rao/en/poster-2x3.png`.

The website reads these paths from `sample.json`. If you add a new title or change a path, update its `assets` values in `sample.json` for both languages. Preserve the category, slug, language, and artwork filename pattern so replacements remain easy to locate.