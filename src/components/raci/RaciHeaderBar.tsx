"use client";

/**
 * RACI Header Bar
 * Logo upload and chart title editing with validation
 */

import { useRef, useState } from "react";
import { ValidationResult } from "@/types/raci";
import { validateLogoFile } from "@/lib/raci/validation";

interface RaciHeaderBarProps {
  title: string;
  logo?: string;
  onTitleChange: (title: string) => void;
  onLogoChange: (logo: string) => void;
  validation: ValidationResult;
}

export default function RaciHeaderBar({
  title,
  logo,
  onTitleChange,
  onLogoChange,
  validation,
}: RaciHeaderBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string>("");

  const titleError = validation.getFieldError("title");
  const logoFieldError = validation.getFieldError("logo");

  const handleTitleChange = (newTitle: string) => {
    onTitleChange(newTitle);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const errors = validateLogoFile(file);
    if (errors.length > 0) {
      setLogoError(errors[0].message);
      return;
    }

    setLogoError("");

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onLogoChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onLogoChange("");
    setLogoError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 p-4 border-b border-border">
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
            className="text-sm text-red-600 flex items-center gap-1"
            role="alert"
          >
            ⚠️ {titleError.message}
          </div>
        )}
      </div>

      {/* Logo Section */}
      <div className="space-y-2">
        <label
          htmlFor="logo-input"
          className="text-sm font-medium text-foreground"
        >
          Logo
        </label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              ref={fileInputRef}
              id="logo-input"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer"
              aria-label="Upload logo"
              aria-describedby={logoError ? "logo-error" : undefined}
              aria-invalid={!!logoError || !!logoFieldError}
            />
            {(logoError || logoFieldError) && (
              <div
                id="logo-error"
                className="text-sm text-red-600 mt-1 flex items-center gap-1"
                role="alert"
              >
                ⚠️ {logoError || logoFieldError?.message}
              </div>
            )}
          </div>

          {/* Logo Preview */}
          {logo && (
            <div className="flex items-center gap-2">
              <img
                src={logo}
                alt="Logo preview"
                className="h-12 w-12 object-contain rounded-md border border-border"
              />
              <button
                onClick={handleRemoveLogo}
                className="px-3 py-1.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm"
                aria-label="Remove logo"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
