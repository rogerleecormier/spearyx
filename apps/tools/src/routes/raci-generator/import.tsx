/**
 * RACI Generator Import Route
 * Handles importing charts from public links
 *
 * URL format: /tools/raci-generator/import?data=<encoded-payload>
 *
 * This route:
 * 1. Decodes the chart data from the URL
 * 2. Temporarily stores it in sessionStorage (browser tab specific)
 * 3. Navigates to the generator which loads and displays it
 * 4. Works across any browser/machine/device
 */

import {
  createFileRoute,
  useSearch,
  useNavigate,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { decodeChart, EncodingError } from "@/lib/encoding";
import { RaciChart } from "@/types/raci";

interface ImportSearch {
  data?: string;
}

export const Route = createFileRoute("/raci-generator/import")({
  component: RaciImportRoute,
  staticData: {
    title: "Import RACI Chart",
  },
});

function RaciImportRoute() {
  const search = useSearch({ strict: false }) as ImportSearch;
  const navigate = useNavigate();
  const [importedChart, setImportedChart] = useState<RaciChart | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    // Validate and decode the chart from URL
    if (!search.data) {
      setImportError("No chart data found in URL. Please check your link.");
      setIsValidating(false);
      return;
    }

    try {
      const chart = decodeChart(search.data);
      setImportedChart(chart);
      setImportError(null);
      setIsValidating(false);
    } catch (error) {
      let errorMessage = "Failed to import chart";

      if (error instanceof EncodingError) {
        const errorMessages: Record<string, string> = {
          INVALID_CHART: "The chart data is invalid or incomplete.",
          ENCODE_FAILED: "Failed to process the chart data during preparation.",
          DECODE_FAILED:
            "Failed to decode the chart. The link may be corrupted or outdated.",
          INVALID_PAYLOAD: "The link format is invalid. Please check the URL.",
          CORRUPT_DATA:
            "The chart data appears to be corrupted. The link may be incomplete.",
          UNSUPPORTED_VERSION:
            "This chart was created with an incompatible version.",
        };

        errorMessage = errorMessages[error.code] || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setImportError(errorMessage);
      setIsValidating(false);
    }
  }, [search.data]);

  // Navigate to generator with the decoded chart in sessionStorage
  useEffect(() => {
    if (importedChart) {
      // Use sessionStorage for tab-specific temporary storage
      sessionStorage.setItem(
        "raci:importedChart",
        JSON.stringify(importedChart)
      );
      sessionStorage.setItem(
        "raci:importNotification",
        JSON.stringify({
          chartTitle: importedChart.title,
          timestamp: new Date().toISOString(),
          version: importedChart.version,
        })
      );

      // Navigate to the generator which will load from sessionStorage
      navigate({ to: "/raci-generator" });
    }
  }, [importedChart, navigate]);

  // If still validating, show loading state
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Validating chart...
          </h2>
          <p className="text-slate-600 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // If there's an error, show error state with recovery options
  if (importError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Import Failed
            </h2>
            <p className="text-slate-600 mb-6">{importError}</p>

            {/* Recovery Options */}
            <div className="space-y-3">
              <button
                onClick={() => navigate({ to: "/raci-generator" })}
                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                Create New Chart
              </button>

              <button
                onClick={() => {
                  const lastGoodState =
                    localStorage.getItem("raci:lastGoodState");
                  if (lastGoodState) {
                    localStorage.setItem("raci:chart", lastGoodState);
                    navigate({ to: "/raci-generator" });
                  }
                }}
                className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors"
              >
                Restore Last Known State
              </button>

              <a
                href="/raci-generator"
                className="block px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Go to Generator
              </a>
            </div>

            {/* Error Details for Debugging */}
            <details className="mt-6 text-left">
              <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700 font-mono">
                Error Details (for support)
              </summary>
              <pre className="mt-2 p-2 bg-slate-50 rounded text-xs text-slate-600 overflow-auto max-h-32 font-mono">
                {JSON.stringify(
                  {
                    error: importError,
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // If chart was successfully imported, show loading state while navigating
  if (importedChart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-green-500 rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">
            Loading chart...
          </h2>
          <p className="text-slate-600 mt-2">Preparing your RACI chart</p>
        </div>
      </div>
    );
  }

  // Fallback (should not reach here)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-600">Unexpected state during import</p>
      </div>
    </div>
  );
}
