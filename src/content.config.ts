import { defineCollection, z } from "astro:content";
import { glob, file } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      /** What it was built with. */
      tags: z.array(z.string()),
      /** What building it taught me — shown on the case-study page. */
      learned: z.array(z.string()).default([]),
      /** Live site. Omit for projects with nothing deployed. */
      url: z.string().optional(),
      /** Source repository, when there is one. */
      github: z.string().optional(),
      color: z.string(),
      order: z.number(),
      /** Featured projects get the big folder cards; the rest go to the archive. */
      featured: z.boolean().default(false),
      date: z.coerce.date().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    tags: z.array(z.string()).optional(),
  }),
});

// Volunteering and awards live in JSON so entries are easy to append.
// `image` is a path relative to the JSON file itself, e.g.
// "../../assets/volunteering/rcf-build-day.jpg" — Astro optimises it at build.
const volunteering = defineCollection({
  loader: file("./src/content/volunteering/volunteering.json"),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      role: z.string(),
      org: z.string(),
      period: z.string(),
      desc: z.string(),
      tags: z.array(z.string()).default([]),
      url: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

const awards = defineCollection({
  loader: file("./src/content/awards/awards.json"),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      year: z.string(),
      title: z.string(),
      org: z.string(),
      desc: z.string(),
      url: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

export const collections = { projects, blog, volunteering, awards };
