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
import { aiService, AIError } from "@/lib/ai";
import { getTemplates, getTemplateById } from "@/lib/templates";
import { Body, Caption, Title, Label } from "@spearyx/ui-kit";
import { Button } from "@spearyx/ui-kit";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@spearyx/ui-kit";
import { RaciRole, RaciTask, RaciChart } from "@/types/raci";
import { QUICK_PRESETS } from "@/lib/templates";

interface DescriptionPanelProps {
  title: string;
  description: string;
  onChange: (description: string) => void;
  onTitleChange: (title: string) => void;
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
  title,
  description,
  onChange,
  onTitleChange,
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
  const [isTitleEditable, setIsTitleEditable] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef<string | null>(null);

  const handleTitleEditClick = () => {
    setIsTitleEditable(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  };

  // ... (keep existing handleGenerate and other handlers) ...

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
    <div className="space-y-8">
      {/* Project Title Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label
              htmlFor="project-title"
              className="text-sm font-semibold text-slate-900"
            >
              Project Title
            </Label>
            {!isTitleEditable && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                ✨ AI Generated
              </span>
            )}
          </div>
          {!isTitleEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTitleEditClick}
              className="h-8 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              Edit Manually
            </Button>
          )}
        </div>
        <div className="relative group">
          <input
            ref={titleInputRef}
            id="project-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter a project title..."
            className={`w-full px-4 py-3 text-base border rounded-lg transition-all duration-200 ${
              isTitleEditable
                ? "bg-white border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 shadow-sm"
                : "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
            }`}
            readOnly={!isTitleEditable}
            disabled={disabled}
          />
        </div>
      </div>

      {/* Description Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="description"
            className="text-sm font-semibold text-slate-900"
          >
            Project Description
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 cursor-help hover:text-slate-800 transition-colors">
                <Info className="w-3.5 h-3.5" />
                <span>How it works</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              We analyze your description to suggest relevant roles and tasks
              based on project templates.
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="relative">
          <textarea
            id="description"
            value={description}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Describe your project in detail...&#10;&#10;Example: 'We are building a mobile app for a food delivery service. We need a product manager to oversee the roadmap, a backend engineer for the API, and a designer for the UI. The project involves user authentication, order tracking, and payment processing.'"
            className="w-full px-4 py-4 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 min-h-[240px] resize-y text-base leading-relaxed shadow-sm transition-all duration-200"
            disabled={disabled || isLoading}
            aria-label="Project description"
            aria-describedby={error ? "description-error" : "description-help"}
          />
        </div>
        <Caption className="text-xs text-slate-500">
          The more details you provide, the more accurate the generated RACI chart
          will be.
        </Caption>
      </div>

      {/* Error Message */}
      {error && (
        <div
          id="description-error"
          className="flex items-start gap-3 p-4 rounded-lg bg-error-50 border border-error-100 animate-in fade-in slide-in-from-top-2"
          role="alert"
        >
          <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <Title as="h4" className="text-sm font-semibold text-error-900 mb-1">
              Generation Failed
            </Title>
            <Body className="text-sm text-error-700">{error}</Body>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg bg-success-50 border border-success-100 animate-in fade-in slide-in-from-top-2"
          role="status"
        >
          <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <Title as="h4" className="text-sm font-semibold text-success-900 mb-1">
              Success!
            </Title>
            <Body className="text-sm text-success-700">
              {isFallback
                ? "Generated using smart templates based on your project description!"
                : "Roles and tasks generated successfully!"}
            </Body>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <Button
          onClick={handleGenerate}
          disabled={disabled || isLoading || !description.trim()}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Project...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate Roles & Tasks
            </>
          )}
        </Button>

        {isLoading && (
          <Button
            onClick={handleCancel}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-800"
            disabled={!isLoading}
          >
            Cancel Generation
          </Button>
        )}

        {rateLimitInfo && (
          <p className="text-center text-xs text-slate-400 mt-2">
            {rateLimitInfo}
          </p>
        )}
      </div>

      {/* Quick Prompt Templates - Moved to bottom */}
      <div className="pt-6 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Need Inspiration? Try an Example
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {getTemplates()
            .filter((template) => template.aiPrompt)
            .map((template) => (
              <button
                key={template.id}
                onClick={() => handleQuickPrompt(template.aiPrompt!)}
                className="group p-3 text-left rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 flex items-start gap-3"
                title={template.aiPromptDescription}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-100 transition-colors">
                  <span className="text-sm">💡</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
                    {template.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {template.aiPromptDescription}
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
