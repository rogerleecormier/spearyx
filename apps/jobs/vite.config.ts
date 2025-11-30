import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig({
  plugins: [
    // TanStack Start must come first for proper routing
    tanstackStart({
      // Configure for Cloudflare deployment
      deployment: {
        preset: "cloudflare-pages",
      },
    }),
    // Cloudflare plugin for local D1 bindings during development
    cloudflare({
      configPath: "./wrangler.dev.toml",
      persistState: true,
    }),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
  ],
  optimizeDeps: {
    exclude: ["wrangler"],
  },
  ssr: {
    // Don't externalize D1 and Cloudflare packages
    noExternal: ["drizzle-orm"],
  },
});

export default config;
