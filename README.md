# rion-o.github.io

Personal site for Young Hun Oh (Henry Oh). A hand-written static site: plain HTML, CSS and a small vanilla JS file. There is no build step, no dependencies and no tracking.

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | The whole page (hero, about, timeline, contact, command palette markup) |
| `assets/style.css` | Styles, dark and light themes |
| `assets/main.js` | Theme toggle, typed intro, timeline, command palette, shortcuts |
| `404.html` | Not-found page |
| `favicon.svg`, `og.png` | Icon and social preview image |
| `files/cv200316.pdf` | CV, linked from the page |

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Paths are root-absolute (`/assets/...`), so serve from the repo root.

## Deploy

GitHub Pages serves the repo root from `master`. Edit the files, commit, push. Nothing needs to be built.

## Shortcuts

`Ctrl/Cmd+K` or `/` command palette, `T` theme, `1` `2` `3` jump to a section, `E` expand or collapse the timeline, `?` help.
