# Allied Work Docs (static, Tailwind CDN)

## Overview
Static documentation + changelog for Allied Work. Uses Tailwind CDN so no build step required.

## How to use
1. Create the file/folder structure shown in the project tree.
2. Paste contents from each code block into the matching file.
3. Open `index.html` (or `changelog.html`) in your browser.

## Notes
- Images referenced in `data/changelog.json` should be added under `assets/images/` (placeholders used).
- The project loads `data/*.json` via fetch — ensure files are served from a filesystem or simple static server.  
  - For local dev, open via VS Code Live Server or run `python -m http.server` in the project root to avoid CORS/file loading issues.
