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
    lastUpdated: z.coerce.date().optional(),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    type: z.enum(["live", "post"]).default("post"),
    tags: z.array(z.string()),
    tableOfContents: z.boolean().optional(),
  }),
});

export const collections = {
  blog,
};
