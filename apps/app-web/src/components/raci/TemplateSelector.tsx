"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { RaciTemplate, getTemplates } from "@/lib/raci/templates";
import { Button } from "@spearyx/ui-kit";
import { Card, CardHeader, CardContent } from "@spearyx/ui-kit";
import { Label, Caption } from "@spearyx/ui-kit";

interface TemplateSelectorProps {
  onLoadTemplate: (template: RaciTemplate) => void;
  isLoading?: boolean;
}

export function TemplateSelector({
  onLoadTemplate,
  isLoading = false,
}: TemplateSelectorProps) {
  const templates = getTemplates();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RaciTemplate | null>(
    null
  );

  const handleLoad = (template: RaciTemplate) => {
    onLoadTemplate(template);
    setIsOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <Card className="w-full bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <Label className="text-base font-semibold text-slate-900">
          Load Template
        </Label>
        <Caption className="text-slate-600">
          Start with a pre-configured template to quickly set up your RACI chart
        </Caption>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Dropdown Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-3 flex items-center justify-between bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors text-left"
          >
            <span className="text-sm text-slate-700">
              {selectedTemplate
                ? selectedTemplate.name
                : "Select a template..."}
            </span>
            <ChevronDown
              size={20}
              className={`text-slate-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown List */}
          {isOpen && (
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
              {templates.map((template, index) => (
                <div key={template.id}>
                  <button
                    onClick={() => setSelectedTemplate(template)}
                    className="w-full p-3 text-left hover:bg-slate-50 transition-colors border-l-4 border-transparent hover:border-primary-500"
                  >
                    <div className="font-medium text-sm text-slate-900">
                      {template.name}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {template.roles.length} roles × {template.tasks.length}{" "}
                      tasks
                    </div>
                  </button>
                  {index < templates.length - 1 && (
                    <div className="border-t border-slate-200" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Template Details */}
          {selectedTemplate && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
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
                      className="px-2 py-1 text-xs font-medium bg-primary-100 text-primary-700 rounded"
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
                      Object.values(taskMap).filter((v) => v !== null).length,
                    0
                  )}{" "}
                  of{" "}
                  {selectedTemplate.roles.length *
                    selectedTemplate.tasks.length}{" "}
                  cells assigned
                </div>
              </div>

              <Button
                onClick={() => handleLoad(selectedTemplate)}
                disabled={isLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
              >
                {isLoading ? "Loading..." : "Load Template"}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
