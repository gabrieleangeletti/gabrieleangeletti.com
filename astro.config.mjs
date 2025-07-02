import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

// https://astro.build/config
export default defineConfig({
  site: "https://gabrieleangeletti.com",
  integrations: [react(), mdx()],
  vite: {
    plugins: [
      cloudflare(),
      tailwindcss({
        config: "./tailwind.config.js",
      }),
    ],
  },
  output: "static",
});
