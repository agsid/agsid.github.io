---
title: "Why Svelte for robotics-team sites"
description: "The reasoning behind picking Svelte for Robolyst and SingulTech instead of a heavier framework."
pubDate: 2026-08-12
tags: ["Svelte", "Robotics"]
---

Both Robolyst and SingulTech run on Svelte. Neither of them needed a big framework — they're mostly forms, tables, and a handful of interactive pages — so a lot of what React or Vue bring to the table would've been overhead.

A few reasons it's held up well for these:

- **Less boilerplate** for the CRUD-heavy screens both sites lean on (rosters, scouting entries, sponsor lists).
- **Small bundle size**, which matters more than it sounds like when teams are checking scouting data on a phone at a competition venue with bad wifi.
- **Compiles away**, so there's less runtime overhead to reason about when something's slow.

Neither choice was dogmatic — if a project needs something heavier later, it'll get it. For now, Svelte's been the right amount of tool for the job.
