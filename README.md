# Dhruv Bhatt — Engineering Portfolio

Personal engineering portfolio with an interactive map of engineering domains and seven project case studies covering mechanical design, automation, simulation, data analysis and fatigue assessment.

## Run locally

This is a static website with no build step or package installation.

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Publish with GitHub Pages

Publish the `main` branch from the repository root (`/`). The `.nojekyll` file allows GitHub Pages to serve the static site directly.

The homepage is `index.html`; project case studies are in `projects/index.html`. Media and scripts use relative paths so the site works under a GitHub Pages repository URL.

## Interaction architecture and checks

`engineering-map.js` owns field selection and dismissal. `map-data.js` holds the existing project content. `media-playback.js` handles visibility and interruption recovery; map and case-study canvas scripts draw only when needed. Shared layout is in `portfolio.css`, with reusable animated illustrations in `visuals.css`.

Run `node --test tests/media-playback.test.cjs` for playback regressions. While serving locally, open `tests/map-browser.html` for pointer, dismissal-race, layout and keyboard checks. See `AUDIT.md` for findings, verification and browser coverage limits.


The motion control in the header pauses/resumes all preview types. Interactive previews start by default; reduced-motion styling removes entrance transitions without silently disabling the project demonstrations. Full project videos retain their original resolution. Map-only videos are encoded separately at 480px with MP4 fast-start metadata. Fonts are self-hosted under `assets/fonts` with their OFL licenses.

Additional browser checks: `tests/playback-browser.html` compares video timestamps, canvas pixels and CSS transforms; `tests/reduced-motion-browser.html` checks the explicit motion controls with a simulated reduced-motion environment.
