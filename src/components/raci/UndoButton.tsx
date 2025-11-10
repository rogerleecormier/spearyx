/**
 * Undo Button
 * Single-step undo with keyboard hint
 */

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface UndoButtonProps {
  canUndo: boolean;
}

export default function UndoButton({ canUndo }: UndoButtonProps) {
  const handleUndo = () => {
    // TODO: Implement undo
    console.log("Undo triggered");
  };

  return (
    <Button
      onClick={handleUndo}
      disabled={!canUndo}
      variant="outline"
      title="Undo last action (Ctrl+Z)"
      aria-label="Undo last action"
    >
      <RotateCcw size={16} />
      Undo
      <span className="text-xs text-muted-foreground ml-1">(Ctrl+Z)</span>
    </Button>
  );
}
