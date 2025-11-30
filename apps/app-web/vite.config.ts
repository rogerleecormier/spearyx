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
      server: {
        preset: "cloudflare-pages",
      },
    }),
    // Cloudflare plugin with proper configuration for D1 bindings
    cloudflare({
      configPath: "./wrangler.toml",
      // Only persist state during local dev to avoid bundling dev deps into the Worker
      persistState: process.env.NODE_ENV !== "production",
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
});

export default config;
