/**
 * Theme Selector
 * Dropdown to select theme with live preview indicator
 */

import { Body } from "@/components/Typography";

interface ThemeSelectorProps {
  theme: string;
  onChange: (theme: string) => void;
}

const THEMES = [
  { id: "default", name: "Website Default" },
  { id: "corporate", name: "Corporate Blue" },
  { id: "minimal", name: "Minimal Grayscale" },
];

export default function ThemeSelector({ theme, onChange }: ThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-sm"
        aria-label="Select chart theme"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <Body className="text-xs text-muted-foreground">
        Theme preview updates in real-time
      </Body>
    </div>
  );
}
