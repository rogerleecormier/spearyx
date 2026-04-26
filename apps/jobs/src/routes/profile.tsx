import { createFileRoute, redirect } from "@tanstack/react-router";
import { getResume } from "@/server/functions/manage-resume";
import { FileUser } from "lucide-react";
import { ResumeManager } from "@/components/features/resume-manager";

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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <FileUser className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Upload or edit your master resume. AI uses this for all analyses and document generation.
          </p>
        </div>
      </div>
      <ResumeManager initial={data} />
    </div>
  );
}

function ProfileLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-96 w-full rounded-xl bg-muted" />
    </div>
  );
}
