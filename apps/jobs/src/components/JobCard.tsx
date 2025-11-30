import {
  ExternalLink,
  Calendar,
  DollarSign,
  Building2,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { JobWithCategory } from "../../lib/jobs/search-utils";
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
      <div className="jobs-job-card">
        <div className="jobs-job-card-header">
          {/* Category badge at top */}
          <span className="jobs-category-badge">{job.category.name}</span>

          {/* Title - full width now */}
          <h3 className="jobs-job-title">{job.title}</h3>

          {/* Company */}
          {job.company && (
            <div className="jobs-job-company">
              <Building2 size={16} />
              <span>{job.company}</span>
            </div>
          )}

          {/* Meta info */}
          <div className="jobs-job-meta">
            {job.payRange && (
              <div className="jobs-meta-item">
                <DollarSign size={16} />
                <span>{job.payRange}</span>
              </div>
            )}
            <div className="jobs-meta-item">
              <Calendar size={16} />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Description preview */}
        {truncatedDescription && (
          <div className="jobs-job-description-preview">
            <p>{truncatedDescription}</p>
          </div>
        )}

        {/* Footer with actions */}
        <div className="jobs-job-card-footer">
          <span className="jobs-source-name">via {job.sourceName}</span>
          <div className="jobs-job-actions">
            <button
              onClick={() => setIsModalOpen(true)}
              className="jobs-quick-view-btn"
            >
              <Eye size={16} />
              Quick View
            </button>
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="jobs-view-job-btn"
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
