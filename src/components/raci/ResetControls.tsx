/**
 * Reset Controls
 * Reset chart contents and theme buttons
 */

import { Button } from "@/components/ui/button";

interface ResetControlsProps {}

export default function ResetControls({}: ResetControlsProps) {
  const handleResetChart = () => {
    if (
      window.confirm(
        "Reset to template? This cannot be undone via this dialog."
      )
    ) {
      // TODO: Implement reset
      console.log("Resetting chart to template");
    }
  };

  const handleResetTheme = () => {
    // TODO: Implement theme reset
    console.log("Resetting theme to default");
  };

  return (
    <div className="space-y-2">
      <Button onClick={handleResetChart} variant="outline" className="w-full">
        Reset Chart Contents
      </Button>
      <Button onClick={handleResetTheme} variant="outline" className="w-full">
        Reset Theme
      </Button>
    </div>
  );
}
