import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";
import robotsTxt from "astro-robots-txt";

export default defineConfig({
  site: "https://agsid.github.io",
  integrations: [sitemap(), robotsTxt()],
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-display",
      weights: [500, 600, 700],
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-body",
      weights: [400, 500, 600, 700],
    },
    {
      provider: fontProviders.google(),
      name: "Rubik",
      cssVariable: "--font-name",
      weights: ["400 900"],
    },
    {
      provider: fontProviders.google(),
      name: "Caveat",
      cssVariable: "--font-hand",
      weights: [600],
    },
  ],
});
