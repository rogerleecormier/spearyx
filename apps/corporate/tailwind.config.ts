import type { Config } from "tailwindcss";
import sharedConfig from "@spearyx/shared-config/tailwind.config";

/**
 * Corporate App Tailwind Configuration
 * Extends the shared design system with app-specific content paths.
 */
const config: Config = {
  ...sharedConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui-kit/**/*.{ts,tsx}",
  ],
};

export default config;
