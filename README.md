# Spearyx

**Precision Project Management**

Cut through the noise with clarity. Hit your targets with precision. Manage projects with focus.

Spearyx is a modern, full-stack project management application built with cutting-edge web technologies. It's designed to provide teams with the clarity and precision they need to deliver projects on time and within scope.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based routing)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Vite integration
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Backend/Hosting**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Testing**: [Vitest](https://vitest.dev/)
- **UI Components**: [Lucide React](https://lucide.dev/) for icons

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation & Development

```bash
npm install
npm run dev
```

The application will start on `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

### Deploying to Cloudflare Workers

```bash
npm run deploy
```

This command builds the application and deploys it to Cloudflare Workers using Wrangler.

## Development

### Running Tests

```bash
npm run test
```

### Preview Production Build

```bash
npm run preview
```

### Generate Cloudflare Types

```bash
npm run cf-typegen
```

## Project Structure

```
src/
├── routes/              # File-based routing (TanStack Router)
│   ├── __root.tsx      # Root layout
│   ├── index.tsx       # Home page
│   └── demo/           # Demo routes
├── components/         # Reusable React components
├── data/               # Data definitions and mock data
└── styles/             # Global styles
```

## Features

- **File-based Routing**: Routes are automatically managed via files in `src/routes/`
- **Server-Side Rendering**: SSR support through TanStack React Start
- **Fast Development**: Vite dev server with hot module replacement
- **TypeScript Support**: Fully typed codebase for safety and developer experience
- **Responsive Design**: Tailwind CSS for modern, mobile-first styling
- **Icon Library**: Lucide React for consistent, scalable icons

## Contributing

When working with this codebase:

1. Create new routes by adding files to `src/routes/`
2. Create reusable components in `src/components/`
3. Keep styles organized using Tailwind CSS utility classes
4. Ensure all code is properly typed with TypeScript

## Resources

- [TanStack Router Documentation](https://tanstack.com/router)
- [TanStack React Start Documentation](https://tanstack.com/start)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
