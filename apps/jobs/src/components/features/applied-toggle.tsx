import { useState, useEffect } from "react";
import { Button } from "@spearyx/ui-kit";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { toggleApplied } from "@/server/functions/toggle-applied";

interface AppliedToggleProps {
  analysisId: number;
  initialApplied: boolean;
}

export function AppliedToggle({ analysisId, initialApplied }: AppliedToggleProps) {
  const [applied, setApplied] = useState(initialApplied);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setApplied(initialApplied);
  }, [analysisId, initialApplied]);

  async function handleToggle() {
    setLoading(true);
    try {
      const result = await toggleApplied({ data: { id: analysisId, applied: !applied } });
      setApplied(result.applied);
    } catch {
      // revert on error
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={applied ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={applied ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600 text-white" : undefined}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : applied ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        <Circle className="h-3.5 w-3.5" />
      )}
      {applied ? "Applied" : "Mark as Applied"}
    </Button>
  );
}
