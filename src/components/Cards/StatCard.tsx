import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
  className?: string
}

export function StatCard({
  value,
  label,
  icon,
  trend,
  className = '',
}: StatCardProps) {
  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600'

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          {icon && <div className="text-2xl text-slate-400">{icon}</div>}
          {trend && <span className={`text-sm font-semibold ${trendColor}`}>{trend.value}</span>}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <p className="text-sm text-slate-600">{label}</p>
      </CardContent>
    </Card>
  )
}
