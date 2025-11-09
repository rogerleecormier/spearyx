import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TimelineEvent {
  date: string
  title: string
  description: string
  icon?: React.ReactNode
  status?: 'completed' | 'current' | 'upcoming'
}

interface TimelineCardProps {
  events: TimelineEvent[]
  className?: string
}

const statusColors = {
  completed: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  current: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  upcoming: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
}

export function TimelineCard({
  events,
  className = '',
}: TimelineCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
        <CardDescription>Activity and event history</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="relative space-y-8">
          {/* Vertical line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-slate-200" />

          {events.map((event, idx) => {
            const status = event.status || 'upcoming'
            const colors = statusColors[status]

            return (
              <div key={idx} className="relative pl-20">
                {/* Timeline dot */}
                <div className={`absolute left-1 top-1 w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
                  {event.icon ? (
                    <div className={colors.text}>{event.icon}</div>
                  ) : (
                    <div
                      className={`w-3 h-3 rounded-full ${colors.dot}`}
                    />
                  )}
                </div>

                {/* Content */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{event.title}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}
                    >
                      {status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{event.description}</p>
                  <p className="text-xs text-slate-500">{event.date}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
