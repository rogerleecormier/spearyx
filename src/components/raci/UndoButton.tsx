/**
 * Undo Button
 * Single-step undo with keyboard hint
 */

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface UndoButtonProps {
  canUndo: boolean;
  onUndo: () => void;
}

export default function UndoButton({ canUndo, onUndo }: UndoButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="outline"
          aria-label="Undo last action (Ctrl+Z)"
        >
          <RotateCcw size={16} />
          Undo
          <span className="text-xs text-muted-foreground ml-1">(Ctrl+Z)</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Undo last action (Ctrl+Z)
      </TooltipContent>
    </Tooltip>
  );
}
