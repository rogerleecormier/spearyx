import {
  ExternalLink,
  Calendar,
  DollarSign,
  Building2,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { JobWithCategory } from "../lib/search-utils";
import { useState } from "react";
import JobDetailModal from "./JobDetailModal";

interface JobCardProps {
  job: JobWithCategory;
}

// Helper to truncate and strip HTML for preview
function getTruncatedDescription(
  html: string | null,
  maxLength: number = 200
): string {
  if (!html) return "";

  // Strip HTML tags for preview
  let text = html.replace(/<[^>]*>/g, "");

  // Decode common HTML entities
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&ndash;": "–",
    "&mdash;": "—",
    "&bull;": "•",
    "&middot;": "·",
  };

  // Replace entities
  text = text.replace(/&[a-zA-Z0-9#]+;/g, (entity) => {
    return entities[entity] || entity;
  });

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();

  if (text.length === 0) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export default function JobCard({ job }: JobCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedDate = job.postDate
    ? formatDistanceToNow(new Date(job.postDate), { addSuffix: true })
    : "Date not specified";

  const truncatedDescription = getTruncatedDescription(job.description, 200);

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
        <div className="p-5 flex-1 flex flex-col">
          {/* Category badge at top */}
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              {job.category.name}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {job.title}
          </h3>

          {/* Company */}
          {job.company && (
            <div className="flex items-center gap-2 text-slate-600 mb-4 text-sm font-medium">
              <Building2 size={16} className="text-slate-400" />
              <span>{job.company}</span>
            </div>
          )}

          {/* Meta info */}
          <div className="mt-auto flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-500">
            {job.payRange && (
              <div className="flex items-center gap-1.5">
                <DollarSign size={16} className="text-slate-400" />
                <span>{job.payRange}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar size={16} className="text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">
            via {job.sourceName}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm"
            >
              <Eye size={16} />
              Quick View
            </button>
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm hover:shadow"
            >
              View Job <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>

      <JobDetailModal
        job={job}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
