/**
 * Preview Modal - Opens a modal with the RACI Matrix preview
 * Styled to match site theme
 */

import { useEffect } from "react";
import { RaciChart } from "@/types/raci";
import RaciPreview from "./RaciPreview";
import { Card, CardContent, CardHeader, CardTitle } from "@spearyx/ui-kit";
import { Caption } from "@spearyx/ui-kit";
import { X } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: RaciChart;
  highContrast: boolean;
}

export default function PreviewModal({
  isOpen,
  onClose,
  chart,
  highContrast,
}: PreviewModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <Card className="w-full max-w-4xl border-slate-200 shadow-2xl my-8 bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-200 pb-4">
            <div className="flex-1">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <span className="text-2xl">👁️</span>
                Live Theme Preview
              </CardTitle>
              <Caption className="text-slate-600 mt-2">
                See how your matrix looks with the current theme
              </Caption>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700 flex-shrink-0"
              aria-label="Close preview modal"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="p-6">
            <RaciPreview chart={chart} highContrast={highContrast} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
