Photos for volunteering entries.

Drop an image here, then point at it from
`src/content/volunteering/volunteering.json`:

    "image": "../../assets/volunteering/rcf-build-day.jpg",
    "imageAlt": "Build session at a Robotics Catalyst event"

Paths are relative to the JSON file. Astro optimises and resizes at build,
so commit the original — no need to pre-crop. Entries without an `image`
render as text-only cards.
