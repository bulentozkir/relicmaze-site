# RelicMaze — Official GitHub Pages Website

Official static GitHub Pages showcase for **RelicMaze** — an original room-by-room temple puzzle platformer for Windows (`144` solver-verified chambers across a `12`-floor stepped pyramid, `11` Hidden Sanctums, `9` Meridian Sigils, and a sliding mine-cart puzzle for each chamber).

## Structure

- `index.html` — Main showcase with an in-game hero still, dated game development notes, on-demand trailer and solver walkthroughs, both original 432 Hz soundtracks, interactive 144-chamber pyramid and 11 Sanctums, illustrated bestiary, Kabeel duel, *Help* plates, narrated *Legend* prologue, Astral Veil diagram, and gallery.
- `trailer.html` — Dedicated English gameplay trailer page with native playback and `VideoObject` structured data.
- `support.html` — Player Support, system requirements, save file locations (`%APPDATA%\RelicMaze`), controls, and accessibility shortcuts.
- `privacy.html` — Privacy Policy (100% offline play, zero telemetry, zero accounts, local-only saves).
- `copyright.html` — Copyright, originality & provenance notice, plus MIT licences for Godot Engine and .NET.
- `robots.txt` and `sitemap.xml` — Crawl guidance and a list of canonical public URLs with image and video entries.
- `site.webmanifest` and `404.html` — Web app manifest (icons, screenshots, theme metadata) and custom `noindex, follow` 404 recovery page for GitHub Pages.
- `.nojekyll` — Static GitHub Pages marker.

## Site presentation

The site uses shared CSS and vanilla JavaScript; there is no build step. Serve the repository with a static HTTP server. When testing the custom 404 page, mount the site under `/relicmaze-site/` to match GitHub Pages: its project-root links also need to work from missing nested URLs. The mobile menu and floor picker work in both directions. Clear View (`F9`) increases contrast. Reduced-motion preferences turn off UI transitions and the prologue word highlight.

Gameplay videos use seekable, inline MP4s and load on demand. The site keeps the original GIFs as source material but uses still previews. Gallery links open directly to full-resolution originals without JavaScript and open a viewer when JavaScript is available. Heavier plates display smaller WebP previews from `assets/thumbnails/`.

The game offers 30 languages; the website has a separate 20-language interface. The English site starts with `assets/js/i18n-data.js` and loads `assets/js/i18n-translations.js` only when a visitor chooses or previously saved another language. If a translated game fact is stale, fall back to current English copy until that translation is reviewed. Keep development notes distinct from published Store releases.

This design pass follows [Unslop](https://github.com/heydamir/unslop) by Damir Sokolovsky ([@heydamir](https://x.com/heydamir)), licensed under CC BY 4.0.

## Search indexing

After publishing, add `https://bulentozkir.github.io/relicmaze-site/` as a URL-prefix property in Google Search Console and submit [sitemap.xml](https://bulentozkir.github.io/relicmaze-site/sitemap.xml). Crawlers look for `robots.txt` at the host root, not under the `/relicmaze-site/` GitHub Pages project path, so do not rely on the project copy for sitemap discovery. If the account publishes a host-root Pages site, its `robots.txt` can reference this sitemap. Inspect the home and trailer URLs after they are live and check Search Console’s video indexing report.

Keep sitemap entries aligned with the canonical tags, and update `<lastmod>` only when a page changes meaningfully. The language selector changes the interface in the browser; those partially translated `?lang=` views are not separate canonical or `hreflang` pages. If the trailer cut changes, update its thumbnail, duration, and original publication date in both [the watch page](./trailer.html) and [the sitemap](./sitemap.xml).
