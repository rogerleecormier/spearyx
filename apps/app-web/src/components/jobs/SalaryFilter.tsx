import { DollarSign } from 'lucide-react'

interface SalaryFilterProps {
  selectedRange: string | null
  onSelectRange: (range: string | null) => void
  includeNoSalary: boolean
  onIncludeNoSalaryChange: (include: boolean) => void
}

// Predefined salary ranges
const salaryRanges = [
  { label: 'All Salaries', value: null },
  { label: 'Under $50k', value: '0-50000' },
  { label: '$50k - $100k', value: '50000-100000' },
  { label: '$100k - $150k', value: '100000-150000' },
  { label: '$150k - $200k', value: '150000-200000' },
  { label: 'Over $200k', value: '200000+' },
]

export default function SalaryFilter({ 
  selectedRange, 
  onSelectRange,
  includeNoSalary,
  onIncludeNoSalaryChange
}: SalaryFilterProps) {
  return (
    <div className="salary-filter">
      <div className="filter-label">
        <DollarSign size={16} />
        <span>Salary Range</span>
      </div>
      <div className="salary-chips">
        {salaryRanges.map((range) => (
          <button
            key={range.value || 'all'}
            onClick={() => onSelectRange(range.value)}
            className={`salary-chip ${selectedRange === range.value ? 'active' : ''}`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      <div className="no-salary-option">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={includeNoSalary} 
            onChange={(e) => onIncludeNoSalaryChange(e.target.checked)}
          />
          <span>Include jobs with no salary info</span>
        </label>
      </div>

      <style>{`
        .salary-filter {
          margin-bottom: 1.5rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.75rem;
        }

        .salary-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .salary-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .salary-chip:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .salary-chip.active {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3);
        }

        @media (max-width: 768px) {
          .salary-chips {
            max-height: 120px;
            overflow-y: auto;
            flex-direction: column;
            align-items: stretch;
          }

          .salary-chip {
            justify-content: center;
          }
        }

        .no-salary-option {
          margin-top: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
          cursor: pointer;
        }

        .checkbox-label input {
          accent-color: #10b981;
          width: 1rem;
          height: 1rem;
        }
      `}</style>
    </div>
  )
}
