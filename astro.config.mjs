import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflareAdapter from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://gabrieleangeletti.com",
  integrations: [react(), mdx(), sitemap()],
  adapter: cloudflareAdapter({
    imageService: "compile",
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    plugins: [
      tailwindcss({
        config: "./tailwind.config.js",
      }),
    ],
    resolve: {
      dedupe: ["react", "react-dom"],
    },
  },
  output: "server",
});
