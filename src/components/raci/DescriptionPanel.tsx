/**
 * Description Panel
 * Project description input with AI integration placeholder
 */

interface DescriptionPanelProps {
  description: string;
  onChange: (description: string) => void;
}

/**
 * Description Panel
 * Multi-line text area for project description
 */

import { Body } from "@/components/Typography";

interface DescriptionPanelProps {
  description: string;
  onChange: (description: string) => void;
}

export default function DescriptionPanel({
  description,
  onChange,
}: DescriptionPanelProps) {
  return (
    <div className="space-y-3">
      <textarea
        value={description}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the project scope and objectives..."
        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-24"
      />
      <Body className="text-xs text-muted-foreground">
        Provide context about your project to help teams understand the RACI
        structure.
      </Body>
    </div>
  );
}
