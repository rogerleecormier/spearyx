import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const isDev = process.env.NODE_ENV !== "production";

const config = defineConfig({
  plugins: [
    // TanStack Start must come first for proper routing
    tanstackStart({
      server: {
        preset: "cloudflare-pages",
      },
    }),
    // Cloudflare plugin only for development - provides local D1 bindings
    ...(isDev
      ? [
          cloudflare({
            configPath: "./wrangler.toml",
            persistState: true,
          }),
        ]
      : []),
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
});

export default config;
