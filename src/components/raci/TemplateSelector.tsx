"use client";

import { useState } from "react";
import { RaciTemplate, getTemplates } from "@/lib/raci/templates";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label, Caption } from "@/components/Typography";

interface TemplateSelectorProps {
  onLoadTemplate: (template: RaciTemplate) => void;
  isLoading?: boolean;
}

export function TemplateSelector({
  onLoadTemplate,
  isLoading = false,
}: TemplateSelectorProps) {
  const templates = getTemplates();
  const [selectedId, setSelectedId] = useState<string | null>(
    templates.length > 0 ? templates[0].id : null
  );
  const [showPreview, setShowPreview] = useState(false);

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  const handleLoad = () => {
    if (selectedTemplate) {
      onLoadTemplate(selectedTemplate);
      setShowPreview(false);
      setSelectedId(null);
    }
  };

  return (
    <Card className="w-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <Label className="text-base font-semibold text-slate-900">
          Load Template
        </Label>
        <Caption className="text-slate-600">
          Start with a pre-configured template to quickly set up your RACI
          chart
        </Caption>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedId(template.id)}
              className={`p-3 text-left rounded-lg border-2 transition-all ${
                selectedId === template.id
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-red-300"
              }`}
            >
              <div className="font-medium text-sm text-slate-900">
                {template.name}
              </div>
              <div className="text-xs text-slate-600 mt-1 line-clamp-2">
                {template.description}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {template.roles.length} roles × {template.tasks.length} tasks
              </div>
            </button>
          ))}
        </div>

        {/* Template Preview */}
        {selectedTemplate && (
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full text-sm"
            >
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>

            {showPreview && (
              <Card className="p-4 bg-slate-50 border border-slate-200">
                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-slate-600 uppercase">
                      Description
                    </div>
                    <p className="text-sm text-slate-700 mt-1">
                      {selectedTemplate.description}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-600 uppercase">
                      Roles ({selectedTemplate.roles.length})
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedTemplate.roles.map((role) => (
                        <span
                          key={role.id}
                          className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-600 uppercase">
                      Tasks ({selectedTemplate.tasks.length})
                    </div>
                    <div className="space-y-2 mt-2">
                      {selectedTemplate.tasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="text-sm">
                          <div className="font-medium text-slate-700">
                            {task.name}
                          </div>
                          {task.description && (
                            <div className="text-xs text-slate-600">
                              {task.description}
                            </div>
                          )}
                        </div>
                      ))}
                      {selectedTemplate.tasks.length > 5 && (
                        <div className="text-xs text-slate-500 italic">
                          +{selectedTemplate.tasks.length - 5} more tasks
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-600 uppercase">
                      Matrix Coverage
                    </div>
                    <div className="text-sm text-slate-700 mt-1">
                      {Object.values(selectedTemplate.matrix).reduce(
                        (sum, taskMap) =>
                          sum +
                          Object.values(taskMap).filter((v) => v !== null)
                            .length,
                        0
                      )}{" "}
                      of{" "}
                      {selectedTemplate.roles.length *
                        selectedTemplate.tasks.length}{" "}
                      cells assigned
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleLoad}
            disabled={!selectedTemplate || isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Loading..." : "Load Template"}
          </Button>
        </div>

        {!selectedTemplate && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Please select a template to load
          </div>
        )}
        </div>
      </CardContent>
    </Card>
  );
}
