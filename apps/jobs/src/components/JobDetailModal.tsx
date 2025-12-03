import { X, ExternalLink, Calendar, DollarSign, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import type { JobWithCategory } from "../lib/search-utils";

interface JobDetailModalProps {
  job: JobWithCategory;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobDetailModal({
  job,
  isOpen,
  onClose,
}: JobDetailModalProps) {
  const [fullDescription, setFullDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If we have the full description in the DB (e.g. Himalayas/RemoteOK), use it immediately
    if (job.fullDescription) {
      setFullDescription(job.fullDescription);
      setIsLoading(false);
      return;
    }

    if (isOpen && job.sourceUrl && job.company) {
      // If we already have a long description (likely full), maybe skip? 
      // But user wants dynamic fetch. Let's fetch if it looks like a summary or just always to be safe.
      // For now, let's always fetch to ensure we get the full HTML.
      
      const fetchContent = async () => {
        setIsLoading(true);
        try {
          const params = new URLSearchParams({
            url: job.sourceUrl,
            company: job.company || ''
          });
          
          const response = await fetch(`/api/v2/job-content?${params.toString()}`);
          if (response.ok) {
            const data = await response.json() as { content?: string };
            if (data.content) {
              setFullDescription(data.content);
            }
          }
        } catch (error) {
          console.error("Failed to fetch job content:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchContent();
    } else {
      // Reset when closed or invalid
      setFullDescription(null);
      setIsLoading(false);
    }
  }, [isOpen, job.sourceUrl, job.company]);

  if (!isOpen) return null;

  const formattedDate = job.postDate
    ? formatDistanceToNow(new Date(job.postDate), { addSuffix: true })
    : "Date not specified";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b-2 border-slate-200 gap-4">
          <div className="flex-1 flex flex-col gap-3">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{job.title}</h2>
            <span className="inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {job.category.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Metadata */}
          <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-slate-200">
            {job.company && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 size={18} className="text-slate-400" />
                <span>{job.company}</span>
              </div>
            )}
            {job.payRange && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <DollarSign size={18} className="text-slate-400" />
                <span>{job.payRange}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Calendar size={18} className="text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Job Description</h3>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                <p>Loading full description...</p>
                {/* Show summary while loading if available */}
                {job.description && (
                  <div className="mt-6 opacity-50" dangerouslySetInnerHTML={{ __html: job.description }} />
                )}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: fullDescription || job.description || 'No description available.' }} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t-2 border-slate-200 gap-4 flex-wrap bg-slate-50 rounded-b-2xl">
          <span className="text-sm font-medium text-slate-500">via {job.sourceName}</span>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm hover:shadow"
          >
            View Job <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
