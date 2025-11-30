/**
 * High Contrast Toggle
 * Accessibility toggle for high-contrast mode
 */

import { useCallback } from "react";

interface HighContrastToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export default function HighContrastToggle({
  enabled,
  onChange,
}: HighContrastToggleProps) {
  const handleToggle = useCallback(() => {
    onChange(!enabled);
  }, [enabled, onChange]);

  return (
    <div className="flex flex-col gap-3">
      {/* High Contrast Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label
            htmlFor="high-contrast-toggle"
            className="text-sm font-medium text-slate-900"
          >
            High Contrast Mode
          </label>
          <p className="text-xs text-slate-600 mt-1">
            Enhanced colors for better visibility
          </p>
        </div>
        <button
          id="high-contrast-toggle"
          onClick={handleToggle}
          role="switch"
          aria-checked={enabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? "bg-primary-600" : "bg-slate-300"
          }`}
          aria-label={`High contrast mode ${enabled ? "on" : "off"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Status Information */}
      <div className="text-xs text-slate-600 p-2 bg-slate-50 rounded">
        {enabled ? (
          <p>
            ✓ High contrast mode is <strong>enabled</strong>
          </p>
        ) : (
          <p>
            ○ High contrast mode is <strong>disabled</strong>
          </p>
        )}
      </div>
    </div>
  );
}
