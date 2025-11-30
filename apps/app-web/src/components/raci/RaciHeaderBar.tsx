"use client";

/**
 * RACI Header Bar
 * Logo upload and chart title editing with validation
 */

import { ValidationResult } from "@/types/raci";

interface RaciHeaderBarProps {
  title: string;
  onTitleChange: (title: string) => void;
  validation: ValidationResult;
}

export default function RaciHeaderBar({
  title,
  onTitleChange,
  validation,
}: RaciHeaderBarProps) {
  const titleError = validation.getFieldError("title");

  const handleTitleChange = (newTitle: string) => {
    onTitleChange(newTitle);
  };

  return (
    <div className="space-y-4 p-4">
      {/* Title Section */}
      <div className="space-y-2">
        <label
          htmlFor="title-input"
          className="text-sm font-medium text-foreground"
        >
          Project Title
        </label>
        <div className="relative">
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter project title"
            maxLength={100}
            className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            aria-label="Project title"
            aria-describedby={titleError ? "title-error" : "title-counter"}
            aria-invalid={!!titleError}
          />
          <div
            id="title-counter"
            className="text-xs text-muted-foreground mt-1 text-right"
          >
            {title.length}/100
          </div>
        </div>
        {titleError && (
          <div
            id="title-error"
            className="text-sm text-error-600 flex items-center gap-1"
            role="alert"
          >
            ⚠️ {titleError.message}
          </div>
        )}
      </div>
    </div>
  );
}
