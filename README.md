# Dhruv Bhatt — Engineering Portfolio

Personal engineering portfolio with an interactive map of engineering domains and seven project case studies covering mechanical design, automation, simulation, data analysis and fatigue assessment.

## Run locally

This is a static website with no build step or package installation.

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. The browser bundle for Motion 14.14.0 is checked in under `assets/vendor/motion` with its MIT license, so the site can serve animations without a build or a third-party script request.

## Publish with GitHub Pages

Publish the `main` branch from the repository root (`/`). The `.nojekyll` file allows GitHub Pages to serve the static site directly.

The homepage is `index.html`; project case studies are in `projects/index.html`. Media and scripts use relative paths so the site works under a GitHub Pages repository URL.

## Interaction architecture and checks

`engineering-map.js` owns field selection and dismissal. `map-data.js` holds the existing project content. `media-playback.js` handles visibility and interruption recovery; map canvas previews and the shared engineering scenes draw only when visible. Shared layout is in `portfolio.css`, with reusable animated illustrations in `visuals.css`.

Run `node --test tests/media-playback.test.cjs` for playback regressions. While serving locally, open `tests/map-browser.html` for pointer, dismissal-race, layout and keyboard checks. See `AUDIT.md` for findings, verification and browser coverage limits.


Previews autoplay without a global header control or stored Pause preference; reduced-motion styling removes entrance transitions without silently disabling the project demonstrations. Full project videos retain their original resolution. Map-only videos are encoded separately at 480px with MP4 fast-start metadata. Fonts are self-hosted under `assets/fonts` with their OFL licenses.

Additional browser checks: `tests/playback-browser.html` compares video timestamps, canvas pixels and CSS transforms; `tests/reduced-motion-browser.html` checks autoplay with an obsolete saved Pause setting in a simulated reduced-motion environment.
