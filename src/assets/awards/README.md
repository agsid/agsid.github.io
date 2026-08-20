Photos for awards entries.

Drop an image here, then point at it from
`src/content/awards/awards.json`:

    "image": "../../assets/awards/first-control-award.jpg",
    "imageAlt": "Accepting the Innovation in Control award"

Paths are relative to the JSON file. Astro optimises and resizes at build,
so commit the original — no need to pre-crop. Entries without an `image`
render as text-only cards.
