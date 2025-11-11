"use client";

import { useState, useEffect } from "react";
import {
  getCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  RaciPreset,
} from "@/lib/raci/templates";
import { RaciChart } from "@/types/raci";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label, Caption } from "@/components/Typography";

interface PresetManagerProps {
  currentMatrix: RaciChart["matrix"];
  onLoadPreset: (matrix: RaciChart["matrix"]) => void;
  isLoading?: boolean;
}

export function PresetManager({
  currentMatrix,
  onLoadPreset,
  isLoading = false,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<RaciPreset[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load presets on mount
  useEffect(() => {
    const savedPresets = getCustomPresets();
    setPresets(savedPresets);
  }, []);

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert("Please enter a preset name");
      return;
    }

    setIsSaving(true);
    try {
      const newPreset = saveCustomPreset({
        name: presetName.trim(),
        description: presetDescription.trim(),
        matrix: currentMatrix,
      });

      setPresets([...presets, newPreset]);
      setPresetName("");
      setPresetDescription("");
      setShowSave(false);
    } catch (error) {
      console.error("Failed to save preset:", error);
      alert("Failed to save preset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadPreset = (preset: RaciPreset) => {
    onLoadPreset(preset.matrix);
    setSelectedPresetId(null);
  };

  const handleDeletePreset = (id: string) => {
    if (confirm("Are you sure you want to delete this preset?")) {
      const success = deleteCustomPreset(id);
      if (success) {
        setPresets(presets.filter((p) => p.id !== id));
        if (selectedPresetId === id) {
          setSelectedPresetId(null);
        }
      } else {
        alert("Failed to delete preset");
      }
    }
  };

  return (
    <Card className="w-full p-6 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold text-slate-900">
            Custom Presets
          </Label>
          <Caption className="text-slate-600">
            Save and load your own RACI matrix presets
          </Caption>
        </div>

        {/* Save Preset Form */}
        {showSave && (
          <Card className="p-4 bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Preset Name
              </label>
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g., Mobile App Standard"
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={presetDescription}
                onChange={(e) => setPresetDescription(e.target.value)}
                placeholder="Describe when to use this preset..."
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSavePreset}
                disabled={isSaving || !presetName.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {isSaving ? "Saving..." : "Save Preset"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowSave(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Save Button */}
        {!showSave && (
          <Button
            onClick={() => setShowSave(true)}
            className="w-full bg-red-100 text-red-700 hover:bg-red-200"
          >
            Save Current Matrix as Preset
          </Button>
        )}

        {/* Presets List */}
        {presets.length > 0 ? (
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">
              Your Presets ({presets.length})
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPresetId === preset.id
                      ? "border-red-500 bg-red-50"
                      : "border-slate-200 hover:border-red-300"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() =>
                        setSelectedPresetId(
                          selectedPresetId === preset.id ? null : preset.id
                        )
                      }
                    >
                      <div className="font-medium text-sm text-slate-900">
                        {preset.name}
                      </div>
                      {preset.description && (
                        <div className="text-xs text-slate-600 mt-1">
                          {preset.description}
                        </div>
                      )}
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(preset.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLoadPreset(preset)}
                        disabled={isLoading}
                        className="text-xs px-2 py-1"
                      >
                        Load
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-xs px-2 py-1 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">
            {showSave
              ? "Enter a name to save your first preset"
              : "No custom presets yet. Save your first preset above!"}
          </div>
        )}
      </div>
    </Card>
  );
}
