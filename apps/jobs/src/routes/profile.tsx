import { createFileRoute, redirect } from "@tanstack/react-router";
import { getResume } from "@/server/functions/manage-resume";
import { FileUser } from "lucide-react";
import { ResumeManager } from "@/components/features/resume-manager";
import { PageHero, PageSection } from "@spearyx/ui-kit";

export const Route = createFileRoute("/profile")({
  beforeLoad: ({ context }) => {
    const ctx = context as { user?: { id: number } | null };
    if (!ctx.user) throw redirect({ to: "/login" });
  },
  loader: async () => getResume(),
  component: ProfilePage,
  pendingComponent: ProfileLoading,
});

function ProfilePage() {
  const data = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <PageHero
        eyebrow="Candidate Profile"
        icon={<FileUser className="h-3.5 w-3.5" />}
        title="My Profile"
        description="Upload or refine your master resume. Spearyx uses this profile across analyses, resume generation, and cover letter generation."
      />
      <PageSection
        title="Master Resume"
        description="Keep one high-quality source resume here so analysis and document generation stay grounded in the same profile."
      >
        <ResumeManager initial={data} />
      </PageSection>
    </div>
  );
}

function ProfileLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-96 w-full rounded-xl bg-muted" />
    </div>
  );
}
