# Repository Guidelines

## Project Structure & Module Organization
The site is built with Astro 5 and React islands. Core pages live in `src/pages`, shared layouts in `src/layouts`, and reusable UI in `src/components`. Long-form content and MDX entries sit in `src/content` with schema declared in `src/content.config.ts`. Styling is split between Tailwind utilities (configured in `tailwind.config.js`) and project-wide CSS in `src/styles`. Static assets belong in `public`; the production bundle is emitted to `dist/` during builds and read by the Cloudflare Worker defined in `wrangler.jsonc`.

## Build, Test, and Development Commands
`pnpm dev` starts Astro’s dev server with hot reload. `pnpm build` runs `astro check` for type safety, then compiles the static output for Cloudflare. `pnpm preview` serves the built bundle for validation before deploy. `pnpm lint` runs ESLint across `.astro`, `.ts`, and `.tsx` files, while `pnpm format` applies Prettier defaults across the repo.

## Coding Style & Naming Conventions
Follow the Prettier configuration (two-space indentation, single quotes in JS/TS) and rely on ESLint to surface Astro/React rules. Name Astro pages with `kebab-case` routes (for example, `src/pages/about.astro`) and React components with `PascalCase` filenames (`src/components/AppShell.astro`). Co-locate component styles, keep Tailwind utility classes expressive, and prefer TypeScript types from `src/types` when available.

## Testing Guidelines
There is no dedicated automated test suite yet; rely on `pnpm build` to surface type and integration issues. When adding significant behaviour, include lightweight assertions via Astro’s built-in testing or Playwright snapshot tests stored under `src/tests` (create the folder as needed). Document any manual QA steps in pull requests so others can reproduce them.

## Commit & Pull Request Guidelines
Commits in this repo use short, action-focused imperatives (`update astro`, `add table of contents`). Group related changes and avoid mixing content updates with design tweaks. Pull requests should include a concise summary, linked issues or TODO references when relevant, and before/after screenshots for noticeable UI changes. Confirm `pnpm lint` and `pnpm build` pass locally before requesting review.

## Deployment & Configuration Tips
Deployments target Cloudflare Workers. Run `pnpm build` and push to the default branch to trigger the pipeline; local previews can be validated with `pnpm preview`. Keep environment-specific secrets in the Cloudflare dashboard—never commit them. If worker bindings change, mirror updates in `wrangler.jsonc` and highlight them in the PR description.
