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
import { getTemplates } from "@/lib/raci/templates";
import { Body, Caption } from "@/components/Typography";
import { Button } from "@/components/ui/button";
import { RaciRole, RaciTask } from "@/types/raci";

interface DescriptionPanelProps {
  description: string;
  onChange: (description: string) => void;
  onGenerateRoles?: (roles: RaciRole[]) => void;
  onGenerateTasks?: (tasks: RaciTask[]) => void;
  onGenerateComplete?: (roles: RaciRole[], tasks: RaciTask[]) => void;
  disabled?: boolean;
  onFallbackStatusChange?: (isFallback: boolean) => void;
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

      // Call combined callback if available, otherwise call individual ones
      if (onGenerateComplete) {
        console.log("Calling onGenerateComplete with roles and tasks");
        onGenerateComplete(roleObjects, taskObjects);
      } else {
        // Fall back to individual callbacks for backward compatibility
        if (onGenerateRoles) {
          onGenerateRoles(roleObjects);
        }
        if (onGenerateTasks) {
          onGenerateTasks(taskObjects);
        }
      }

      // Check if fallback was used
      const fallbackUsed = aiService.isFallbackActive();
      setIsFallback(fallbackUsed);
      if (onFallbackStatusChange) {
        onFallbackStatusChange(fallbackUsed);
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
          <div className="group relative">
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
              Select a template to populate your description
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {getTemplates()
            .filter((template) => template.aiPrompt)
            .map((template) => (
              <button
                key={template.id}
                onClick={() => handleQuickPrompt(template.aiPrompt!)}
                className="group relative p-2 text-left text-xs font-medium bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-400 rounded transition-colors min-h-12 flex items-center justify-center"
                title={template.aiPromptDescription}
              >
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-blue-600 text-sm">✨</span>
                  <span className="text-slate-900 leading-tight">
                    {template.name}
                  </span>
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded py-2 px-3 whitespace-normal z-50 shadow-lg pointer-events-none w-max max-w-xs">
                  {template.aiPromptDescription}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>
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
          <div className="group relative">
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 cursor-help flex-shrink-0" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 pointer-events-none">
              AI uses this to suggest roles and tasks
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-slate-900" />
            </div>
          </div>
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
