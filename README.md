# Spearyx Monorepo

This repository is a monorepo containing the Spearyx application and shared libraries.

## Structure

- **apps/app-web**: The main web application built with TanStack Start.
- **packages/ui-kit**: Shared UI component library.

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run development server:**

   ```bash
   npx turbo run dev
   ```

3. **Build for production:**
   ```bash
   npx turbo run build
   ```

## Workspaces

This project uses npm workspaces. You can run commands in specific workspaces:

```bash
npm run dev -w @spearyx/app-web
```

## Deploying

The repo is configured to deploy the monorepo as a single Cloudflare Worker using the root `wrangler.toml`.

- Build command: `npm run build` (this runs `turbo run build` by default)
- Cloudflare / GitHub integration: connect the repo and set the build command to `npm ci && npm run build` (or just `npm run build` if you already have CI install) and ensure the integration is configured to run on `main` or whichever branch you prefer.
- Wrapper: The root `wrangler.toml` points to `apps/app-web/dist/server/server.js` as `main` and `apps/app-web/dist/client` as the assets directory, so `wrangler` will deploy the built artifacts from `apps/app-web/dist`.
- Local dev: For local Cloudflare dev, use the workspace-level `apps/app-web/wrangler.toml` combined with `wrangler dev` or `npm run dev -w @spearyx/app-web`.

If you prefer a GitHub Actions workflow (optional), you can add a simple one to build & deploy with `wrangler publish`.
