import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../lib/utils";
import { Button } from "../ui/button";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageSlots(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, null, totalPages];
  if (page >= totalPages - 3)
    return [1, null, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, null, page - 1, page, page + 1, null, totalPages];
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const slots = getPageSlots(page, totalPages);
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      {slots.map((slot, i) =>
        slot === null ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable ellipsis positions
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-slate-400">
            …
          </span>
        ) : (
          <Button
            key={slot}
            variant={slot === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(slot)}
            aria-label={`Page ${slot}`}
            aria-current={slot === page ? "page" : undefined}
          >
            {slot}
          </Button>
        ),
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
