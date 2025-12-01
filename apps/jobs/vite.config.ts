import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const config = defineConfig({
  plugins: [
    // TanStack Start must come first for proper routing
    tanstackStart(),
    // Cloudflare plugin provides D1 bindings in development and production
    cloudflare({
      configPath: "./wrangler.toml",
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
