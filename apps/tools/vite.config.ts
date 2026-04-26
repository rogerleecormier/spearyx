import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import viteTsConfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV !== "production";

const config = defineConfig({
  plugins: [
    tanstackStart(),
    cloudflare({
      configPath: "./wrangler.toml",
    }),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    viteReact(),
  ],
  resolve: {
    alias: {
      ...(isDev
        ? {
            "cloudflare:workers": path.resolve(
              __dirname,
              "src/stubs/cloudflare-workers-stub.ts"
            ),
          }
        : {}),
    },
  },
  optimizeDeps: {
    exclude: ["wrangler"],
  },
  build: {
    rollupOptions: {
      external: ["cloudflare:workers"],
    },
  },
  ssr: {
    external: ["cloudflare:workers"],
  },
});

export default config;
