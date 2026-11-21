# RelicMaze — Official GitHub Pages Website

Official static GitHub Pages showcase for **RelicMaze** — an original room-by-room temple puzzle platformer for Windows (`144` solver-verified chambers across a `12`-floor stepped pyramid, `11` Hidden Sanctums, `9` Meridian Sigils, spectral relics, and `20` languages).

## Structure

- `index.html` — Main showcase page with an in-game hero still, on-demand trailer and solver walkthroughs, both original 432 Hz soundtracks, interactive 144-chamber pyramid and 11 Sanctums, illustrated bestiary, Kabeel duel, *Help* plates, narrated *Legend* prologue, Astral Veil diagram, and gallery.
- `trailer.html` — Dedicated English gameplay trailer page with native playback and `VideoObject` structured data.
- `support.html` — Player Support, system requirements, save file locations (`%APPDATA%\RelicMaze`), controls, and accessibility shortcuts.
- `privacy.html` — Privacy Policy (100% offline play, zero telemetry, zero accounts, local-only saves).
- `copyright.html` — Copyright, originality & provenance notice, plus MIT licences for Godot Engine and .NET.
- `robots.txt` and `sitemap.xml` — Crawl guidance and a list of canonical public URLs with image and video entries.
- `site.webmanifest` and `404.html` — Web app manifest (icons, screenshots, theme metadata) and custom `noindex, follow` 404 recovery page for GitHub Pages.
- `.nojekyll` — Static GitHub Pages marker.

## Site presentation

The site uses shared CSS and vanilla JavaScript; there is no build step. Serve the repository with a static HTTP server to preview it locally. The mobile menu and floor picker work in left-to-right and right-to-left layouts. Clear View (`F9`) increases contrast, and reduced-motion preferences turn off UI transitions, the soundtrack visualizer, and the prologue word highlight.

Gameplay videos use seekable, inline MP4s and load on demand. Their original GIFs remain in `assets/media/` and `assets/previews/` as source material; the page shows stills until visitors choose to play. The original screenshots, illustrations, and key art remain available at full resolution in the viewer.

This design pass follows [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed under CC BY 4.0.

## Search indexing

After publishing, add `https://bulentozkir.github.io/relicmaze-site/` as a URL-prefix property in Google Search Console and submit [sitemap.xml](https://bulentozkir.github.io/relicmaze-site/sitemap.xml). Crawlers look for `robots.txt` at the host root, not under the `/relicmaze-site/` GitHub Pages project path, so do not rely on the project copy for sitemap discovery. Inspect the home and trailer URLs after they are live.

Keep sitemap entries aligned with the canonical tags, and update `<lastmod>` only when a page changes meaningfully. The language selector changes the interface in the browser; those partially translated `?lang=` views are not separate canonical or `hreflang` pages. If the trailer cut changes, update its thumbnail, duration, and original publication date in both [the watch page](./trailer.html) and [the sitemap](./sitemap.xml).
