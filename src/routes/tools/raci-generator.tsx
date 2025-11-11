/**
 * RACI Generator Route
 * Server-rendered entry point with client boundary
 *
 * Supports import via search params:
 * - /tools/raci-generator?importData=<encoded> - direct import
 */

import { createFileRoute } from "@tanstack/react-router";
import RaciGeneratorPage from "@/components/raci/RaciGeneratorPage";

interface RaciGeneratorSearch {
  importData?: string;
}

export const Route = createFileRoute("/tools/raci-generator")({
  component: RaciGeneratorPageRoute,
  validateSearch: (search: Record<string, unknown>): RaciGeneratorSearch => {
    return {
      importData: search.importData as string | undefined,
    };
  },
  staticData: {
    title: "RACI Chart Generator",
  },
});

function RaciGeneratorPageRoute() {
  return <RaciGeneratorPage />;
}
