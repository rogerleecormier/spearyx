import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getHistory } from "@/server/functions/get-history";
import { History } from "lucide-react";
import { requireLoginRedirect } from "@/lib/auth-redirect";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/history")({
  beforeLoad: ({ context }) => {
    const ctx = context as { user?: { id: number } | null };
    if (!ctx.user) requireLoginRedirect("/history", "analysis history");
  },
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => getHistory({ data: { page: deps.page, pageSize: PAGE_SIZE } }),
  component: HistoryPage,
  pendingComponent: HistoryLoading,
});

function HistoryPage() {
  const { rows, total } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const navigate = useNavigate();
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">Browse analyses and download documents.</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          No analyses yet. Start by analyzing a job posting.
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Job</th>
                <th className="px-4 py-3 text-left font-medium">Company</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Applied</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <a href={`/analyze/${row.id}`} className="font-medium hover:underline">
                      {row.jobTitle}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.company}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {row.matchScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {row.applied ? (
                      <span className="text-xs text-green-600 font-medium">Applied</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.createdAt?.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{total} total</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ to: "/history", search: { page: page - 1 } })}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 py-1">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => navigate({ to: "/history", search: { page: page + 1 } })}
              className="rounded-md border px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 animate-pulse">
      <div className="h-10 w-48 rounded-lg bg-muted" />
      <div className="h-96 w-full rounded-xl bg-muted" />
    </div>
  );
}
