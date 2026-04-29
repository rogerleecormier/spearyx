import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ExternalLink,
  FileText,
  History,
  Loader2,
  Mail,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import {
  deleteHistoryItem,
  getDocumentDownload,
  getHistory,
} from "@/server/functions/get-history";
import type { HistoryRow } from "@/server/functions/get-history";
import { requireLoginRedirect } from "@/lib/auth-redirect";
import { PageActionBar, PageHero, PageSection } from "@spearyx/ui-kit";
import { AppliedToggle } from "@/components/features/applied-toggle";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/history")({
  beforeLoad: ({ context, location }) => {
    const ctx = context as { user?: { id: number } | null };
    if (!ctx.user) requireLoginRedirect(location, "analysis history");
  },
  validateSearch: (search: Record<string, unknown>) => ({
    page: Number(search.page) || 1,
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: async ({ deps }) => getHistory({ data: { page: deps.page, pageSize: PAGE_SIZE } }),
  component: HistoryPage,
  pendingComponent: HistoryLoading,
});

type Row = HistoryRow;

async function triggerDownload(r2Key: string, fileName: string) {
  const result = await getDocumentDownload({ data: { r2Key } });
  const blob = new Blob([new Uint8Array(result.data)], { type: result.contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function HistoryPage() {
  const loaderData = Route.useLoaderData();
  const { page } = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();

  const [rows, setRows] = useState(loaderData.rows);
  const [total, setTotal] = useState(loaderData.total);
  const [totalApplied, setTotalApplied] = useState(loaderData.totalApplied);
  const [totalPursued] = useState(loaderData.totalPursued);
  const [totalDocuments] = useState(loaderData.totalDocuments);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  const [confirmingRow, setConfirmingRow] = useState<Row | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const avgScore = useMemo(() =>
    rows.length
      ? Math.round((rows.reduce((s, r) => s + r.matchScore, 0) / rows.length) * 10) / 10
      : 0,
  [rows]);

  async function handleDownload(r2Key: string, fileName: string) {
    setDownloadingKey(r2Key);
    try { await triggerDownload(r2Key, fileName); }
    finally { setDownloadingKey(null); }
  }

  function handleAppliedChange(id: number, applied: boolean) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, applied } : r))
    );
    setTotalApplied((prev) => Math.max(0, prev + (applied ? 1 : -1)));
  }

  async function handleDeleteConfirmed() {
    if (!confirmingRow) return;
    setDeletingId(confirmingRow.id);
    try {
      await deleteHistoryItem({ data: { id: confirmingRow.id } });
      const nextRows = rows.filter((r) => r.id !== confirmingRow.id);
      const nextTotal = Math.max(total - 1, 0);
      setRows(nextRows);
      setTotal(nextTotal);
      setConfirmingRow(null);
      const nextTotalPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      if (page > nextTotalPages) {
        await navigate({ to: "/history", search: { page: nextTotalPages } });
      } else if (nextRows.length === 0 && page > 1) {
        await navigate({ to: "/history", search: { page: page - 1 } });
      } else {
        await router.invalidate();
      }
    } finally {
      setDeletingId(null);
    }
  }

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "jobTitle",
        header: ({ column }) => (
          <SortHeader
            label="Position"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div>
            <Link
              to="/analyze/$id"
              params={{ id: String(row.original.id) }}
              className="font-semibold text-slate-900 hover:text-primary-600 transition-colors line-clamp-1"
            >
              {row.original.jobTitle}
            </Link>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{row.original.company}</p>
          </div>
        ),
        size: 260,
      },
      {
        accessorKey: "matchScore",
        header: ({ column }) => (
          <SortHeader
            label="Match"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ getValue }) => <ScorePill score={getValue() as number} />,
        size: 80,
      },
      {
        accessorKey: "pursue",
        header: "Status",
        cell: ({ row }) => (
          <StatusPill applied={row.original.applied} pursue={row.original.pursue} />
        ),
        size: 90,
      },
      {
        accessorKey: "applied",
        header: "Applied",
        cell: ({ row }) => (
          <AppliedToggle
            analysisId={row.original.id}
            initialApplied={row.original.applied}
            onAppliedChange={(applied) => handleAppliedChange(row.original.id, applied)}
          />
        ),
        size: 150,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortHeader
            label="Analyzed"
            sorted={column.getIsSorted()}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-slate-500">{formatDate(getValue() as string)}</span>
        ),
        size: 110,
      },
      {
        id: "documents",
        header: "Documents",
        cell: ({ row }) => {
          const resumeDoc = row.original.documents.find((d) => d.docType === "resume");
          const coverDoc = row.original.documents.find((d) => d.docType === "cover_letter");
          return (
            <div className="flex items-center gap-1.5">
              {resumeDoc ? (
                <DocButton
                  icon={downloadingKey === resumeDoc.r2Key
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <FileText className="h-3.5 w-3.5" />}
                  label="Resume"
                  onClick={() => handleDownload(resumeDoc.r2Key, resumeDoc.fileName || "resume.pdf")}
                />
              ) : (
                <DocButtonDisabled label="Resume" />
              )}
              {coverDoc ? (
                <DocButton
                  icon={downloadingKey === coverDoc.r2Key
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Mail className="h-3.5 w-3.5" />}
                  label="Cover"
                  onClick={() => handleDownload(coverDoc.r2Key, coverDoc.fileName || "cover-letter.pdf")}
                />
              ) : (
                <DocButtonDisabled label="Cover" />
              )}
            </div>
          );
        },
        size: 160,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <a
              href={`/analyze/${row.original.id}`}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
              title="Open analysis"
            >
              <Search className="h-3.5 w-3.5" />
            </a>
            {row.original.jobUrl && (
              <a
                href={row.original.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
                title="View job description"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              onClick={() => setConfirmingRow(row.original)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Delete analysis"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
        size: 100,
      },
    ],
    [downloadingKey]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="spx-page spx-stack">
      <PageHero
        eyebrow="Analysis History"
        icon={<History className="h-3.5 w-3.5" />}
        title="Review past analyses"
        description="Revisit saved analyses, reopen the original job description, and grab the resume or cover letter tied to each role."
        stats={[
          { label: "Total Saved", value: String(total) },
          { label: "Applied", value: String(totalApplied) },
          { label: "Avg Match", value: `${avgScore}%` },
        ]}
        actions={
          <Link
            to="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            <Zap className="h-4 w-4" />
            Analyze a Job
          </Link>
        }
      />

      {/* Summary tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricTile
          label="Pursue Recommendations"
          value={String(totalPursued)}
          note="Total roles recommended to pursue"
          tone="emerald"
        />
        <MetricTile
          label="Applications Logged"
          value={String(totalApplied)}
          note="Total roles marked as applied"
          tone="sky"
        />
        <MetricTile
          label="Documents Available"
          value={String(totalDocuments)}
          note="Total resume and cover letter files"
          tone="violet"
        />
      </div>
      <div className="flex justify-end">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          See more metrics
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table */}
      {rows.length === 0 ? (
        <PageSection>
          <div className="flex flex-col items-center py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <History className="h-6 w-6 text-slate-500" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">No analyses yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Start by analyzing a job posting. Your saved analyses, generated resumes, and cover letters will show up here.
            </p>
            <Link
              to="/analyze"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              <Zap className="h-4 w-4" />
              Analyze a Job
            </Link>
          </div>
        </PageSection>
      ) : (
        <PageSection
          title={`Analyses — page ${page} of ${totalPages}`}
          description={`${total} total saved analyses`}
        >
          <div className="overflow-x-auto -mx-6">
            <table className="w-full min-w-[720px]">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-slate-100">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-slate-100/70 transition-colors hover:bg-slate-50/60 ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className="px-4 py-3 align-middle"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageSection>
      )}

      {totalPages > 1 && (
        <PageActionBar>
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages} · {total} total
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => navigate({ to: "/history", search: { page: page - 1 } })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => navigate({ to: "/history", search: { page: page + 1 } })}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </PageActionBar>
      )}

      {confirmingRow && (
        <ConfirmDeleteModal
          row={confirmingRow}
          deleting={deletingId === confirmingRow.id}
          onCancel={() => { if (deletingId !== confirmingRow.id) setConfirmingRow(null); }}
          onConfirm={handleDeleteConfirmed}
        />
      )}
    </div>
  );
}

/* ── Sub-components ── */

function SortHeader({
  label,
  sorted,
  onClick,
}: {
  label: string;
  sorted: false | "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 uppercase tracking-wider text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
    >
      {label}
      <ArrowUpDown
        className={`h-3 w-3 transition-opacity ${sorted ? "opacity-100 text-primary-500" : "opacity-40"}`}
      />
    </button>
  );
}

function ScorePill({ score }: { score: number }) {
  const tone =
    score >= 75
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : score >= 60
        ? "bg-sky-50 text-sky-700 border-sky-100"
        : "bg-amber-50 text-amber-700 border-amber-100";
  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-sm font-semibold ${tone}`}>
      {score}%
    </span>
  );
}

function StatusPill({ applied, pursue }: { applied: boolean; pursue: boolean }) {
  if (applied)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Applied
      </span>
    );
  if (pursue)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
        Pursue
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Review
    </span>
  );
}

function DocButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
      {label}
    </button>
  );
}

function DocButtonDisabled({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-slate-100 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-300">
      <FileText className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

const toneMap = {
  emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
  sky: "bg-sky-50 border-sky-100 text-sky-700",
  violet: "bg-violet-50 border-violet-100 text-violet-700",
} as const;

function MetricTile({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: keyof typeof toneMap;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.84)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(226,232,240,0.7)",
        boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
      }}
    >
      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>
        {label}
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function ConfirmDeleteModal({
  row,
  deleting,
  onCancel,
  onConfirm,
}: {
  row: Row;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900">Delete this analysis?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This will remove{" "}
          <span className="font-medium text-slate-900">{row.jobTitle}</span> from your history,
          along with any saved resume or cover letter.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function HistoryLoading() {
  return (
    <div className="spx-page space-y-6 animate-pulse">
      <div className="h-36 rounded-2xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-muted" />
    </div>
  );
}
