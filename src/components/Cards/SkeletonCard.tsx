import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SkeletonCardProps {
  variant?: 'product' | 'profile' | 'basic' | 'feature'
  className?: string
}

export function SkeletonCard({
  variant = 'basic',
  className = '',
}: SkeletonCardProps) {
  const pulse = 'animate-pulse'

  if (variant === 'product') {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <div className={`h-48 bg-slate-200 ${pulse}`} />
        <CardHeader className="pb-3">
          <div className={`h-5 bg-slate-200 rounded w-3/4 mb-3 ${pulse}`} />
          <div className={`h-4 bg-slate-200 rounded w-1/2 ${pulse}`} />
          <div className="flex gap-2 mt-3">
            <div className={`h-6 bg-slate-200 rounded w-16 ${pulse}`} />
            <div className={`h-6 bg-slate-200 rounded w-16 ${pulse}`} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={`h-10 bg-slate-200 rounded w-full ${pulse}`} />
        </CardContent>
      </Card>
    )
  }

  if (variant === 'profile') {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div
              className={`w-24 h-24 rounded-full bg-slate-200 ${pulse}`}
            />
          </div>
          <div className={`h-5 bg-slate-200 rounded w-3/4 mx-auto mb-3 ${pulse}`} />
          <div className={`h-4 bg-slate-200 rounded w-1/2 mx-auto ${pulse}`} />
        </CardHeader>
        <CardContent>
          <div className={`h-10 bg-slate-200 rounded w-full ${pulse}`} />
        </CardContent>
      </Card>
    )
  }

  if (variant === 'feature') {
    return (
      <Card className={`overflow-hidden ${className}`}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-lg bg-slate-200 flex-shrink-0 ${pulse}`}
            />
            <div className="flex-1">
              <div className={`h-5 bg-slate-200 rounded w-3/4 mb-2 ${pulse}`} />
              <div className={`h-4 bg-slate-200 rounded w-full ${pulse}`} />
            </div>
          </div>
        </CardHeader>
      </Card>
    )
  }

  // Default basic variant
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader>
        <div className={`h-5 bg-slate-200 rounded w-3/4 mb-3 ${pulse}`} />
        <div className={`h-4 bg-slate-200 rounded w-full mb-2 ${pulse}`} />
        <div className={`h-4 bg-slate-200 rounded w-5/6 ${pulse}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className={`h-3 bg-slate-200 rounded w-full ${pulse}`} />
          <div className={`h-3 bg-slate-200 rounded w-5/6 ${pulse}`} />
        </div>
      </CardContent>
    </Card>
  )
}
