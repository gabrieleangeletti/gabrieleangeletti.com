---
title: How I built this website
slug: how-I-built-this-website
excerpt: The tech, the choices, and the approach behind this website.
author: Gabriele Angeletti
timestamp: 2025-07-27
status: published
tags: [software-engineering]
---

When it comes to software architecture, I’m a [KISSer (Keep It Simple, Stupid)](https://en.wikipedia.org/wiki/KISS_principle). I like straightforward solutions that get the job done. I'm not a fan of overcomplicated, over-engineered setups. Of course, things are rarely black and white. If they were, the GPTs, Claudes, and Geminis of the world would’ve already taken over.

Deploying your startup’s zero-users, zero-funded MVP backend onto a Kubernetes cluster? Bad idea. Writing a CLI in Rust to convert `.csv` to `.json` just because you love Rust and have been writing it for the past 5 years? Why not, go for it.

So, what’s behind this website? Well, I didn’t go for the absolute simplest solution. But I went for something I enjoy using, that’s flexible and easy to grow. Like many real-world projects, I have only a fuzzy idea of what this site will eventually become. Right now, it’s my online business card and résumé. But I also want it to be a blog. And maybe a personal dashboard to track adventures, running training, or whatever else I dream up.

At a high-level, I wanted a _static, front-end only website_. Easy to deploy and basically free to host. But I also wanted the option to grow it into something more dynamic later on. I started hacking around with this setup:

- React with TypeScript
- TailwindCSS + DaisyUI
- Vite
- Hash-based routing

This gave me:

- Fast and easy static site generation
- Full design freedom
- A future upgrade path (e.g. switch to Next.js or similar)

But there were some drawbacks:

- **SEO**. Hash-based routing is awful for SEO. You can mitigate it a bit with `#!`, but it’s still far from ideal. It’s a good pattern for simple SPAs. It just doesn’t make sense when you want good SEO and crawlable pages.
- **Blog functionality**: I wanted the blog to be a bunch of static files (`.json`, `.md`, etc.) rendered dynamically. But I knew building this from scratch would mean diving into a rabbit hole of edge cases and plugins for rendering Markdown and beyond.

### Enter Astro

The front-end world has a framework for anything. [Astro](https://astro.build/) felt like the perfect fit. With Astro, I can:

- Ditch hash-based routing.
- Keep the sweet static site generation.
- Use [Content Collections](https://docs.astro.build/en/guides/content-collections/). This is exactly the blog system I needed. I can just drop in `.md` files and focus on writing.
- Keep using React for more complex UI, and simply import the components into `.astro` components. Funnily enough, this is the first time React actually felt like a “library”.
- Gain access to the world of Astro’s integrations and plugins.

I’ve seen people saying Astro’s not great for highly-interactive websites. People say that about a lot of frameworks. Looking at you, HTMX. Personally, I’ve never hit this magic UX threshold. Maybe if you’re building Twitch or Figma.

As engineers, our job is to pick the right tool for the job. Hammer for nails, screwdriver for screws. For this kind of project, Astro is a damn good screwdriver.
