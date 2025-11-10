/**
 * Error Modal
 * Accessible error dialog with recovery actions
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Body } from "@/components/Typography";

interface ErrorModalProps {}

export default function ErrorModal({}: ErrorModalProps) {
  // TODO: Connect to state management
  const isOpen = false;
  const error = null;

  if (!isOpen || !error) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-labelledby="error-title"
      aria-describedby="error-description"
    >
      <Card className="max-w-md w-full mx-4">
        <CardHeader>
          <CardTitle id="error-title" className="text-destructive">
            ⚠️ Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div id="error-description" className="text-muted-foreground">
            <Body>An error occurred. Please try again.</Body>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline">Next Steps</Button>
            <Button>Contact Admin</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
