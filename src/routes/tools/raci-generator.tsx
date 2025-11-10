/**
 * RACI Generator Route
 * Server-rendered entry point with client boundary
 */

import { createFileRoute } from "@tanstack/react-router";
import RaciGeneratorPage from "@/components/raci/RaciGeneratorPage";

export const Route = createFileRoute("/tools/raci-generator")({
  component: RaciGeneratorPageRoute,
  staticData: {
    title: "RACI Chart Generator",
  },
});

function RaciGeneratorPageRoute() {
  return <RaciGeneratorPage />;
}
