---
title: "Rebuilding this site with Astro + Tailwind"
description: "Notes on why I moved this portfolio from a single static page to a full Astro site with content collections."
pubDate: 2026-08-19
tags: ["Astro", "Tailwind", "Meta"]
---

I started with a single `index.html` — hero, about, projects, contact, all on one page. It worked, but it didn't leave much room for writing anything longer, like an actual case study per project.

Rebuilding it in Astro gave me a few things the single page couldn't:

- **Content collections** for projects and blog posts, so adding a new one is just a markdown file, not a new hand-built section.
- **Per-project pages** with real case-study writeups instead of a three-line card.
- **A journal** (this) for notes that don't belong on a project page or the about page.

Tailwind v4 plugs straight into Astro's Vite config now, no separate integration needed, and Astro's built-in fonts API handles self-hosting Google Fonts without a `<link>` tag to an external CDN.

More posts to come as I ship more things.
