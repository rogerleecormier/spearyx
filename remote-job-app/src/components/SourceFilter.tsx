import { Filter } from 'lucide-react'

interface SourceFilterProps {
  selectedSource: string | null
  onSelectSource: (source: string | null) => void
}

export default function SourceFilter({
  selectedSource,
  onSelectSource,
}: SourceFilterProps) {
  const sources = [
    { id: 'RemoteOK', name: 'RemoteOK' },
    { id: 'Greenhouse', name: 'Greenhouse' },
    { id: 'Lever', name: 'Lever' },
    { id: 'Himalayas', name: 'Himalayas' }
  ]

  return (
    <div className="filter-section">
      <div className="filter-header">
        <Filter size={16} />
        <h3>Source</h3>
      </div>
      <div className="filter-chips">
        <button
          className={`filter-chip ${selectedSource === null ? 'active' : ''}`}
          onClick={() => onSelectSource(null)}
        >
          All Sources
        </button>
        {sources.map((source) => (
          <button
            key={source.id}
            className={`filter-chip ${
              selectedSource === source.id ? 'active' : ''
            }`}
            onClick={() => onSelectSource(source.id)}
          >
            {source.name}
          </button>
        ))}
      </div>
    </div>
  )
}
