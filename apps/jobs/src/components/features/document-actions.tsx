import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea } from "@spearyx/ui-kit";
import { FileText, Mail, Loader2, Download, RefreshCw } from "lucide-react";
import { generateResume } from "@/server/functions/generate-resume";
import { generateCoverLetter } from "@/server/functions/generate-cover-letter";
import { getDocumentDownload, getDocumentsForAnalysis } from "@/server/functions/get-history";
import { AppliedToggle } from "./applied-toggle";

interface DocumentActionsProps {
  analysisId: number;
  applied?: boolean;
}

type DocResult = { documentId: number; fileName: string; r2Key: string };

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

export function DocumentActions({ analysisId, applied = false }: DocumentActionsProps) {
  const [resumeLoading, setResumeLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [resumeDownloading, setResumeDownloading] = useState(false);
  const [coverDownloading, setCoverDownloading] = useState(false);
  const [resumeResult, setResumeResult] = useState<DocResult | null>(null);
  const [coverResult, setCoverResult] = useState<DocResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extraGuidance, setExtraGuidance] = useState("");

  useEffect(() => {
    getDocumentsForAnalysis({ data: { analysisId } })
      .then((docs) => {
        if (docs.resume) setResumeResult(docs.resume);
        if (docs.coverLetter) setCoverResult(docs.coverLetter);
      })
      .catch(() => {});
  }, [analysisId]);

  const busy = resumeLoading || coverLoading;

  async function handleGenerateResume() {
    setResumeLoading(true);
    setError(null);
    try {
      setResumeResult(await generateResume({ data: { analysisId, extraGuidance: extraGuidance.trim() || undefined } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume generation failed");
    } finally {
      setResumeLoading(false);
    }
  }

  async function handleGenerateCover() {
    setCoverLoading(true);
    setError(null);
    try {
      setCoverResult(await generateCoverLetter({ data: { analysisId, extraGuidance: extraGuidance.trim() || undefined } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cover letter generation failed");
    } finally {
      setCoverLoading(false);
    }
  }

  async function handleDownload(r2Key: string, fileName: string, setDownloading: (v: boolean) => void) {
    setDownloading(true);
    setError(null);
    try {
      await triggerDownload(r2Key, fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Generate Documents</h3>
        <AppliedToggle analysisId={analysisId} initialApplied={applied} />
      </div>

      {/* Guidance textarea */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Extra Tailoring Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={extraGuidance}
            onChange={(e) => setExtraGuidance(e.target.value)}
            placeholder="Optional: e.g. emphasize healthcare domain experience and vendor management leadership."
            disabled={busy}
            rows={3}
            className="resize-y text-sm"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Applied to both resume and cover letter generation.
          </p>
        </CardContent>
      </Card>

      {/* Document panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DocPanel
          icon={<FileText className="h-4 w-4 text-primary" />}
          label="ATS Resume"
          result={resumeResult}
          generating={resumeLoading}
          downloading={resumeDownloading}
          busy={busy}
          onGenerate={handleGenerateResume}
          onDownload={() => resumeResult && handleDownload(resumeResult.r2Key, resumeResult.fileName, setResumeDownloading)}
          generateLabel="Create Resume"
        />
        <DocPanel
          icon={<Mail className="h-4 w-4 text-primary" />}
          label="Cover Letter"
          result={coverResult}
          generating={coverLoading}
          downloading={coverDownloading}
          busy={busy}
          onGenerate={handleGenerateCover}
          onDownload={() => coverResult && handleDownload(coverResult.r2Key, coverResult.fileName, setCoverDownloading)}
          generateLabel="Create Cover Letter"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

interface DocPanelProps {
  icon: React.ReactNode;
  label: string;
  result: DocResult | null;
  generating: boolean;
  downloading: boolean;
  busy: boolean;
  onGenerate: () => void;
  onDownload: () => void;
  generateLabel: string;
}

function DocPanel({ icon, label, result, generating, downloading, busy, onGenerate, onDownload, generateLabel }: DocPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      {result ? (
        <div className="flex gap-2">
          <Button onClick={onDownload} disabled={downloading} size="sm" className="flex-1">
            {downloading ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            Download
          </Button>
          <Button
            onClick={onGenerate}
            disabled={busy}
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            title="Regenerate"
          >
            {generating ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ) : (
        <Button onClick={onGenerate} disabled={busy} size="sm" className="w-full" variant={label === "Cover Letter" ? "secondary" : "default"}>
          {generating ? <Loader2 className="animate-spin h-3.5 w-3.5" /> : icon}
          {generating ? "Creating…" : generateLabel}
        </Button>
      )}
    </div>
  );
}
