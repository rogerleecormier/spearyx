/**
 * Main RACI Generator Page
 * Client-side component mounted on server-rendered route
 */

import { useEffect, useState } from "react";
import { RaciSessionState } from "@/types/raci";
import RaciEditor from "./RaciEditor";
import ErrorModal from "./ErrorModal";
import Toaster from "../ui/Toaster";

export default function RaciGeneratorPage() {
  const now = new Date().toISOString();

  const [state, setState] = useState<RaciSessionState>({
    chart: {
      id: crypto.randomUUID(),
      version: "1.0.0",
      timestamp: now,
      title: "New RACI Chart",
      description: "",
      roles: [],
      tasks: [],
      matrix: {},
      theme: "default",
      createdAt: now,
      updatedAt: now,
    },
    undo: {
      current: {
        id: crypto.randomUUID(),
        version: "1.0.0",
        timestamp: now,
        title: "New RACI Chart",
        description: "",
        roles: [],
        tasks: [],
        matrix: {},
        theme: "default",
        createdAt: now,
        updatedAt: now,
      },
      previous: null,
      canUndo: false,
      lastAction: "Initial state",
    },
    validation: {
      isValid: true,
      errors: [],
    },
    ui: {
      selectedTheme: "default",
      showPreview: false,
      highContrastMode: false,
      notification: null,
      isLoading: false,
      lastSavedAt: now,
    },
  });

  useEffect(() => {
    // TODO: Load from localStorage or initialize with template
    // State is initialized directly above
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <RaciEditor state={state} setState={setState} />
      <ErrorModal />
      <Toaster />
    </main>
  );
}
