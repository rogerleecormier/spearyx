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
