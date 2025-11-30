import { X, ExternalLink, Calendar, DollarSign, Building2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { JobWithCategory } from '../lib/search-utils'

interface JobDetailModalProps {
  job: JobWithCategory
  isOpen: boolean
  onClose: () => void
}

export default function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  if (!isOpen) return null

  const formattedDate = job.postDate
    ? formatDistanceToNow(new Date(job.postDate), { addSuffix: true })
    : 'Date not specified'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-header-content">
            <h2 className="modal-title">{job.title}</h2>
            <span className="category-badge">{job.category.name}</span>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Metadata */}
          <div className="modal-meta">
            {job.company && (
              <div className="meta-item">
                <Building2 size={18} />
                <span>{job.company}</span>
              </div>
            )}
            {job.payRange && (
              <div className="meta-item">
                <DollarSign size={18} />
                <span>{job.payRange}</span>
              </div>
            )}
            <div className="meta-item">
              <Calendar size={18} />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Description */}
          {job.description && (
            <div className="modal-description">
              <h3>Job Description</h3>
              <div dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="source-name">via {job.sourceName}</span>
          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="view-job-btn"
          >
            View Job <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          border-bottom: 2px solid #e2e8f0;
          gap: 1rem;
        }

        .modal-header-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.3;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }

        .modal-close-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }

        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .modal-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-meta .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9375rem;
          color: #475569;
        }

        .modal-description h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 1rem;
        }

        .modal-description {
          color: #334155;
          line-height: 1.7;
          font-size: 1rem;
        }

        .modal-description h1,
        .modal-description h2,
        .modal-description h3,
        .modal-description h4,
        .modal-description h5,
        .modal-description h6 {
          color: #1e293b;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          font-weight: 600;
          line-height: 1.3;
        }

        .modal-description h1 { font-size: 1.5rem; }
        .modal-description h2 { font-size: 1.25rem; }
        .modal-description h3 { font-size: 1.125rem; }
        .modal-description h4 { font-size: 1rem; }

        .modal-description p {
          margin-bottom: 1em;
        }

        .modal-description ul {
          list-style-type: disc;
        }

        .modal-description ol {
          list-style-type: decimal;
        }

        .modal-description ul,
        .modal-description ol {
          margin-bottom: 1em;
          padding-left: 2.5em;
          list-style-position: outside;
        }

        .modal-description li {
          margin-bottom: 0.5em;
          padding-left: 0.25em;
        }
        
        .modal-description li::marker {
          color: #64748b;
        }

        .modal-description a {
          color: #2563eb;
          text-decoration: underline;
          text-underline-offset: 2px;
        }

        .modal-description a:hover {
          color: #1d4ed8;
        }

        .modal-description strong,
        .modal-description b {
          font-weight: 600;
          color: #0f172a;
        }

        .modal-description blockquote {
          border-left: 4px solid #e2e8f0;
          padding-left: 1rem;
          margin-left: 0;
          margin-right: 0;
          color: #64748b;
          font-style: italic;
        }

        .modal-description code {
          background-color: #f1f5f9;
          padding: 0.2em 0.4em;
          border-radius: 4px;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          color: #0f172a;
        }

        .modal-description pre {
          background-color: #1e293b;
          color: #f8fafc;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 1em;
        }

        .modal-description pre code {
          background-color: transparent;
          padding: 0;
          color: inherit;
          font-size: 0.875em;
        }

        .modal-description img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1em 0;
        }

        .modal-description hr {
          border: 0;
          border-top: 1px solid #e2e8f0;
          margin: 2em 0;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-top: 2px solid #e2e8f0;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 768px) {
          .modal-container {
            max-height: 95vh;
            margin: 0.5rem;
          }

          .modal-title {
            font-size: 1.25rem;
          }

          .modal-meta {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  )
}
