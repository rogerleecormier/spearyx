"use client";

/**
 * Logo Uploader Component
 * Handles logo file upload and preview
 */

import { useRef, useState } from "react";
import { ValidationResult } from "@/types/raci";
import { validateLogoFile } from "@/lib/validation";
import { Card, CardContent, CardHeader } from "@spearyx/ui-kit";
import { Label } from "@spearyx/ui-kit";

interface LogoUploaderProps {
  logo?: string;
  onLogoChange: (logo: string) => void;
  validation: ValidationResult;
}

export default function LogoUploader({
  logo,
  onLogoChange,
  validation,
}: LogoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState<string>("");

  const logoFieldError = validation.getFieldError("logo");

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
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-200">
        <Label className="text-slate-700 font-semibold text-xs">Logo</Label>
      </CardHeader>
      <CardContent className="pt-4 pb-4 space-y-4">
        <div className="space-y-3">
          <label
            htmlFor="logo-input"
            className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:border-blue-400 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">
                Click to upload or drag and drop
              </div>
              <div className="text-xs text-slate-500 mt-1">
                PNG, JPG, or SVG (max 5MB)
              </div>
            </div>
            <input
              ref={fileInputRef}
              id="logo-input"
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              className="hidden"
              aria-label="Upload logo"
              aria-describedby={logoError ? "logo-error" : undefined}
              aria-invalid={!!logoError || !!logoFieldError}
            />
          </label>
          {(logoError || logoFieldError) && (
            <div
              id="logo-error"
              className="text-sm text-destructive mt-2 flex items-center gap-1 bg-destructive/10 p-3 rounded-lg border border-destructive/30"
              role="alert"
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {logoError || logoFieldError?.message}
            </div>
          )}
        </div>

        {/* Logo Preview */}
        {logo && (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <img
              src={logo}
              alt="Logo preview"
              className="h-14 w-14 object-contain rounded-md border border-blue-300 bg-white p-1"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-900 truncate">
                Logo uploaded
              </div>
              <div className="text-xs text-slate-500">
                Ready to use in exports
              </div>
            </div>
            <button
              onClick={handleRemoveLogo}
              className="px-3 py-1.5 text-sm font-medium bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-300 hover:border-red-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex-shrink-0"
              aria-label="Remove logo"
            >
              Remove
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
