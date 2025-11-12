"use client";

/**
 * Description Panel Component
 * Project description input with AI integration for smart generation
 *
 * Features:
 * - Multi-line project description textarea
 * - "Generate from Description" button with AI processing
 * - Loading states and progress feedback
 * - Error handling with fallback suggestions
 * - Request cancellation support
 * - Rate limiting feedback
 */

import { useState, useCallback, useRef } from "react";
import { Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";
import { aiService, AIError } from "@/lib/raci/ai";
import { getTemplates, getTemplateById } from "@/lib/raci/templates";
import { Body, Caption } from "@/components/Typography";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { RaciRole, RaciTask, RaciChart } from "@/types/raci";
import { QUICK_PRESETS } from "@/lib/raci/templates";

interface DescriptionPanelProps {
  description: string;
  onChange: (description: string) => void;
  onGenerateRoles?: (roles: RaciRole[]) => void;
  onGenerateTasks?: (tasks: RaciTask[]) => void;
  onGenerateComplete?: (
    roles: RaciRole[],
    tasks: RaciTask[],
    matrix?: RaciChart["matrix"]
  ) => void;
  disabled?: boolean;
  onFallbackStatusChange?: (isFallback: boolean) => void;
}

/**
 * Map AI-classified project types to template IDs
 * Handles case-insensitive and partial matching
 */
function mapProjectTypeToTemplateId(projectType: string): string | null {
  const normalized = projectType.toLowerCase().trim();

  // Map common variations to template IDs
  if (normalized.includes("mobile") && normalized.includes("app")) {
    return "mobile-app";
  }
  if (normalized.includes("web") && normalized.includes("redesign")) {
    return "web-redesign";
  }
  if (normalized.includes("crm") && normalized.includes("migration")) {
    return "crm-migration";
  }

  return null;
}

/**
 * Generate RACI matrix from template by mapping role/task IDs
 * Uses positional mapping to apply template RACI patterns to extracted roles/tasks
 *
 * Strategy:
 * 1. If extracted roles/tasks match template size exactly, use direct mapping
 * 2. Otherwise, use positional mapping with smart fallback to preserve template patterns
 * 3. For extra roles/tasks beyond template, apply best-practice RACI pattern
 */
function generateMatrixFromTemplate(
  template: any,
  _roleNames: string[],
  roleIds: string[],
  taskIds: string[]
): RaciChart["matrix"] | null {
  if (!template || !template.matrix || !template.roles || !template.tasks) {
    console.log(
      "generateMatrixFromTemplate: Template missing required properties",
      {
        hasTemplate: !!template,
        hasMatrix: template?.matrix ? true : false,
        hasRoles: template?.roles ? true : false,
        hasTasks: template?.tasks ? true : false,
      }
    );
    return null;
  }

  const templateRoleIds = template.roles.map((r: any) => r.id);
  const templateTaskIds = template.tasks.map((t: any) => t.id);
  const newMatrix: RaciChart["matrix"] = {};

  // Log the mapping for debugging
  console.log("generateMatrixFromTemplate START:", {
    templateId: template.id,
    templateRoleIds: templateRoleIds,
    templateTaskIds: templateTaskIds,
    extractedRoles: roleIds.length,
    templateRoles: templateRoleIds.length,
    extractedTasks: taskIds.length,
    templateTasks: templateTaskIds.length,
    templateMatrixRoleKeys: Object.keys(template.matrix),
    templateMatrixSample: {
      firstRole: template.matrix[templateRoleIds[0]],
      firstRoleTasks: Object.keys(template.matrix[templateRoleIds[0]] || {})
        .length,
    },
  });

  // For each extracted role, map it to template role by position
  for (let i = 0; i < roleIds.length; i++) {
    const extractedRoleId = roleIds[i];
    const templateRoleId =
      templateRoleIds[Math.min(i, templateRoleIds.length - 1)];

    newMatrix[extractedRoleId] = {};

    // For each extracted task, map it from template
    for (let j = 0; j < taskIds.length; j++) {
      const extractedTaskId = taskIds[j];
      const templateTaskId =
        templateTaskIds[Math.min(j, templateTaskIds.length - 1)];

      // Get the RACI value from template
      const raciValue = template.matrix[templateRoleId]?.[templateTaskId];

      // Log first few entries to see what's happening
      if (i === 0 && j < 3) {
        console.log(
          `Template matrix lookup [${templateRoleId}][${templateTaskId}]:`,
          {
            raciValue,
            templateRoleData: template.matrix[templateRoleId],
            allTemplateTaskIds: Object.keys(
              template.matrix[templateRoleId] || {}
            ),
          }
        );
      }

      if (raciValue) {
        newMatrix[extractedRoleId][extractedTaskId] = raciValue as
          | "R"
          | "A"
          | "C"
          | "I"
          | null;
      } else {
        // If template doesn't have this combination, use best-practice pattern
        // Accountable role (typically 2nd role): A
        // Responsible role (typically 1st role): R
        // Others: C
        if (i === 0) {
          newMatrix[extractedRoleId][extractedTaskId] = "R";
        } else if (i === 1) {
          newMatrix[extractedRoleId][extractedTaskId] = "A";
        } else {
          newMatrix[extractedRoleId][extractedTaskId] = "C";
        }
      }
    }
  }

  // Log results
  console.log("Matrix after template mapping - FINAL:", {
    rolesGenerated: Object.keys(newMatrix).length,
    firstRoleData: newMatrix[roleIds[0]],
    secondRoleData: newMatrix[roleIds[1]],
  });

  return Object.keys(newMatrix).length > 0 ? newMatrix : null;
}

/**
 * Description Panel with AI integration
 */
export default function DescriptionPanel({
  description,
  onChange,
  onGenerateRoles,
  onGenerateTasks,
  onGenerateComplete,
  disabled = false,
  onFallbackStatusChange,
}: DescriptionPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const requestIdRef = useRef<string | null>(null);

  /**
   * Handle AI generation from project description
   */
  const handleGenerate = useCallback(async () => {
    if (!description.trim()) {
      setError("Please enter a project description first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    const requestId = `gen-${Date.now()}`;
    requestIdRef.current = requestId;

    try {
      // Step 1: Classify project type
      const typeResult = await aiService.classifyProjectType(
        description,
        requestId
      );
      const projectType = typeResult.type || "Mobile App";

      // Step 2: Extract roles
      const rolesResult = await aiService.extractRoles(description, requestId);
      console.log("Roles result:", rolesResult);
      let roleNames: string[] = [];
      if (Array.isArray(rolesResult.roles)) {
        roleNames = rolesResult.roles as string[];
      } else if (typeof rolesResult.roles === "string") {
        roleNames = (rolesResult.roles as string)
          .split(",")
          .map((r: string) => r.trim());
      }
      console.log("Extracted role names:", roleNames);

      // Ensure we have at least some roles
      if (roleNames.length === 0) {
        console.warn("No roles extracted, using defaults");
        roleNames = [
          "Product Manager",
          "Backend Engineer",
          "Frontend Engineer",
          "QA Lead",
        ];
      }

      // Step 3: Generate tasks
      const tasksResult = await aiService.generateTasks(
        description,
        projectType,
        roleNames,
        requestId
      );
      const tasks = Array.isArray(tasksResult.tasks)
        ? tasksResult.tasks
        : [{ name: "Task", description: "" }];

      // Create role objects with IDs
      const roleObjects: RaciRole[] = roleNames.map(
        (name: string, idx: number) => ({
          id: `role-${Date.now()}-${idx}`,
          name,
          order: idx,
        })
      );
      console.log("Calling onGenerateRoles with:", roleObjects);

      // Create task objects with IDs
      const taskObjects: RaciTask[] = tasks.map(
        (task: { name: string; description?: string }, idx: number) => ({
          id: `task-${Date.now()}-${idx}`,
          name: task.name,
          description: task.description || "",
          order: idx,
        })
      );
      console.log("Calling onGenerateTasks with:", taskObjects);

      // Check if fallback was used
      const fallbackUsed = aiService.isFallbackActive();
      setIsFallback(fallbackUsed);
      if (onFallbackStatusChange) {
        onFallbackStatusChange(fallbackUsed);
      }

      // Generate matrix if in fallback mode
      let generatedMatrix: RaciChart["matrix"] | undefined;
      if (fallbackUsed) {
        const roleIds = roleObjects.map((r) => r.id);
        const taskIds = taskObjects.map((t) => t.id);

        // Try to use template-based matrix first
        const templateId = mapProjectTypeToTemplateId(projectType);
        let templateMatrix: RaciChart["matrix"] | null = null;

        console.log("Fallback mode - trying to load template", {
          projectType,
          templateId,
          extractedRoleNames: roleNames,
          extractedRoleIds: roleIds,
          extractedTaskNames: taskObjects.map((t) => t.name),
          extractedTaskIds: taskIds,
        });

        if (templateId) {
          const template = getTemplateById(templateId);
          console.log("Template loaded:", {
            templateId,
            found: !!template,
            templateRoles: template?.roles.map((r: any) => ({
              id: r.id,
              name: r.name,
            })),
            templateTasks: template?.tasks.map((t: any) => ({
              id: t.id,
              name: t.name,
            })),
            templateMatrix: template?.matrix,
          });

          if (template) {
            templateMatrix = generateMatrixFromTemplate(
              template,
              roleNames,
              roleIds,
              taskIds
            );
            console.log("Template matrix generated:", {
              generated: !!templateMatrix,
              matrix: templateMatrix,
            });
          }
        }

        // Fall back to functionalTeamModel if template not found or failed
        generatedMatrix =
          templateMatrix || QUICK_PRESETS.functionalTeamModel(roleIds, taskIds);
        console.log("Final generated matrix for fallback:", {
          fromTemplate: !!templateMatrix,
          templateId,
          matrix: generatedMatrix,
        });
      }

      // Call combined callback if available, otherwise call individual ones
      if (onGenerateComplete) {
        console.log("Calling onGenerateComplete with roles, tasks, and matrix");
        onGenerateComplete(roleObjects, taskObjects, generatedMatrix);
      } else {
        // Fall back to individual callbacks for backward compatibility
        if (onGenerateRoles) {
          onGenerateRoles(roleObjects);
        }
        if (onGenerateTasks) {
          onGenerateTasks(taskObjects);
        }
      }

      setSuccess(true);
      setError(null);

      // Show rate limit info only if AI was actually used (not fallback)
      if (!fallbackUsed) {
        const status = aiService.getRateLimitStatus();
        setRateLimitInfo(
          `${status.remaining}/${status.limit} requests remaining this minute`
        );
      } else {
        setRateLimitInfo(null);
      }

      // Auto-clear success message
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof AIError) {
        if (err.code === "RATE_LIMITED") {
          const retryAfter = err.context?.retryAfter || 0;
          setError(
            `Rate limited. Please wait ${Math.ceil(retryAfter / 1000)} seconds before trying again.`
          );
        } else if (err.code === "TIMEOUT") {
          setError(
            "AI request timed out. Please try again or use manual entry for faster results."
          );
        } else if (err.code === "NETWORK_ERROR") {
          setError(
            "Network error. Please check your connection and try again."
          );
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      requestIdRef.current = null;
    }
  }, [description, onGenerateRoles, onGenerateTasks, onFallbackStatusChange]);

  /**
   * Cancel the current AI request
   */
  const handleCancel = useCallback(() => {
    if (requestIdRef.current) {
      aiService.cancelRequest(requestIdRef.current);
      requestIdRef.current = null;
      setIsLoading(false);
      setError("Generation cancelled");
    }
  }, []);

  /**
   * Load a quick prompt template
   */
  const handleQuickPrompt = useCallback(
    (prompt: string) => {
      onChange(prompt);
    },
    [onChange]
  );

  return (
    <div className="space-y-3">
      {/* Quick Prompt Templates */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 uppercase">
            Quick Examples
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              Select a template to populate your description
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {getTemplates()
            .filter((template) => template.aiPrompt)
            .map((template) => (
              <button
                key={template.id}
                onClick={() => handleQuickPrompt(template.aiPrompt!)}
                className="p-2 text-left text-xs font-medium bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 rounded transition-colors min-h-12 flex items-center justify-center"
                title={template.aiPromptDescription}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="text-blue-600 text-sm">✨</span>
                      <span className="text-slate-900 leading-tight">
                        {template.name}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs whitespace-normal"
                  >
                    {template.aiPromptDescription}
                  </TooltipContent>
                </Tooltip>
              </button>
            ))}
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <label htmlFor="description" className="text-sm font-medium">
            Project Description
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              AI uses this to suggest roles and tasks
            </TooltipContent>
          </Tooltip>
        </div>
        <textarea
          id="description"
          value={description}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your project scope, objectives, and team structure... AI can use this to suggest roles and tasks."
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-24 resize-y max-h-80"
          disabled={disabled || isLoading}
          aria-label="Project description"
          aria-describedby={error ? "description-error" : "description-help"}
        />
        <Caption className="text-xs text-muted-foreground">
          Provide context about your project to help AI suggest roles and tasks.
          Drag the bottom-right corner to resize.
        </Caption>
      </div>

      {/* Error Message */}
      {error && (
        <div
          id="description-error"
          className="flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-200"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <Body className="text-sm text-red-600">{error}</Body>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          className="flex items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200"
          role="status"
        >
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <Body className="text-sm text-green-600">
              {isFallback
                ? "✨ Generated using template data (AI unavailable)"
                : "Roles and tasks generated successfully!"}
            </Body>
          </div>
        </div>
      )}

      {/* Rate Limit Info */}
      {rateLimitInfo && (
        <Caption className="text-xs text-muted-foreground">
          {rateLimitInfo}
        </Caption>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={disabled || isLoading || !description.trim()}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate from Description"
          )}
        </Button>

        {isLoading && (
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={!isLoading}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Helper Text */}
      <Caption className="text-xs text-muted-foreground">
        Click &quot;Generate from Description&quot; to use AI to suggest roles
        and tasks based on your project description.
      </Caption>
    </div>
  );
}
