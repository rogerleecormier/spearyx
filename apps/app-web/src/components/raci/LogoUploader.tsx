"use client";

/**
 * Logo Uploader Component
 * Handles logo file upload and preview
 */

import { useRef, useState } from "react";
import { ValidationResult } from "@/types/raci";
import { validateLogoFile } from "@/lib/raci/validation";
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
        <Label className="text-slate-700 font-semibold text-xs">
          Logo
        </Label>
      </CardHeader>
      <CardContent className="pt-4 pb-4 space-y-4">
        <div className="space-y-2">
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                id="logo-input"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-600 file:text-white hover:file:bg-primary-700 cursor-pointer"
                aria-label="Upload logo"
                aria-describedby={logoError ? "logo-error" : undefined}
                aria-invalid={!!logoError || !!logoFieldError}
              />
              {(logoError || logoFieldError) && (
                <div
                  id="logo-error"
                  className="text-sm text-error-600 mt-1 flex items-center gap-1"
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
                  className="px-3 py-1.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
                  aria-label="Remove logo"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
