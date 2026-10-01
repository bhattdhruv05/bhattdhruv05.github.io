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
