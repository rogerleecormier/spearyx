/**
 * Theme Selector
 * Dropdown to select theme with live preview of RACI colors
 */

import { useState } from "react";
import { Body } from "@/components/Typography";
import themes from "@/config/theming.json";

interface ThemeSelectorProps {
  theme: string;
  onChange: (theme: string) => void;
  highContrast?: boolean;
  onHighContrastChange?: (enabled: boolean) => void;
}

interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    raci: {
      r: string;
      a: string;
      c: string;
      i: string;
    };
  };
}

export default function ThemeSelector({
  theme,
  onChange,
  highContrast = false,
  onHighContrastChange,
}: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const themeList = Object.values(themes) as Theme[];
  const currentTheme = themeList.find((t) => t.id === theme) || themeList[0];

  const handleThemeSelect = (themeId: string) => {
    onChange(themeId);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Theme Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: currentTheme.colors.primary }}
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-slate-900">
                {currentTheme.name}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-slate-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-md shadow-lg z-50"
            role="listbox"
          >
            {themeList.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeSelect(t.id)}
                className={`w-full px-3 py-2 text-left hover:bg-slate-100 transition-colors first:rounded-t-md last:rounded-b-md ${
                  t.id === theme
                    ? "bg-blue-50 border-l-2 border-l-blue-500 pl-2"
                    : ""
                }`}
                role="option"
                aria-selected={t.id === theme}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: t.colors.primary }}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-900">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RACI Color Preview */}
      <div className="grid grid-cols-4 gap-3 mt-2 p-4 bg-slate-50 rounded-md">
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-slate-300 shadow-sm flex-shrink-0"
            style={{ backgroundColor: currentTheme.colors.raci.r }}
            title="Responsible"
            aria-label="Responsible color"
          />
          <span className="text-xs font-semibold text-slate-700">R</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-slate-300 shadow-sm flex-shrink-0"
            style={{ backgroundColor: currentTheme.colors.raci.a }}
            title="Accountable"
            aria-label="Accountable color"
          />
          <span className="text-xs font-semibold text-slate-700">A</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-slate-300 shadow-sm flex-shrink-0"
            style={{ backgroundColor: currentTheme.colors.raci.c }}
            title="Consulted"
            aria-label="Consulted color"
          />
          <span className="text-xs font-semibold text-slate-700">C</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-slate-300 shadow-sm flex-shrink-0"
            style={{ backgroundColor: currentTheme.colors.raci.i }}
            title="Informed"
            aria-label="Informed color"
          />
          <span className="text-xs font-semibold text-slate-700">I</span>
        </div>
      </div>

      {/* Theme Description */}
      <Body className="text-xs text-slate-600">{currentTheme.description}</Body>

      {/* High Contrast Toggle */}
      {onHighContrastChange && (
        <>
          <div className="border-t border-slate-200 pt-3 mt-3" />
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-slate-900">
                High Contrast Mode
              </label>
              <p className="text-xs text-slate-600 mt-1">
                Enhanced colors for better visibility
              </p>
            </div>
            <button
              onClick={() => onHighContrastChange(!highContrast)}
              role="switch"
              aria-checked={highContrast}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? "bg-blue-600" : "bg-gray-300"
              }`}
              aria-label={`High contrast mode ${highContrast ? "on" : "off"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  highContrast ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          <div className="text-xs text-slate-600 p-2 bg-slate-50 rounded">
            {highContrast ? (
              <p>
                ✓ High contrast mode is <strong>enabled</strong>
              </p>
            ) : (
              <p>
                ○ High contrast mode is <strong>disabled</strong>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
