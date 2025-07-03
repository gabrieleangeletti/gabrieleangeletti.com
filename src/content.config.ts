import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md*", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    excerpt: z.string().optional(),
    author: z.string().optional(),
    timestamp: z.coerce.date(),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  blog,
};
