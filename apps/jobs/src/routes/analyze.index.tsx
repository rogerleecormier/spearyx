import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { AnalysisForm } from "@/components/features/analysis-form";
import { z } from "zod";
import { requireLoginRedirect } from "@/lib/auth-redirect";

const searchSchema = z.object({
  url: z.string().optional(),
  jd: z.string().optional(),
});

export const Route = createFileRoute("/analyze/")({
  beforeLoad: ({ context }) => {
    const ctx = context as { user?: { id: number } | null };
    if (!ctx.user) requireLoginRedirect("/analyze", "job analysis");
  },
  validateSearch: searchSchema,
  component: AnalyzePage,
});

function AnalyzePage() {
  const { url, jd } = Route.useSearch();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Briefcase className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analyze a Job</h1>
          <p className="text-sm text-muted-foreground">
            Paste a URL or job description for AI-powered match scoring, gap analysis, and career insights.
          </p>
        </div>
      </div>
      <AnalysisForm initialUrl={url} initialJd={jd} />
    </div>
  );
}
