import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ColorVariantCardProps {
  title: string
  description?: string
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink' | 'slate'
  className?: string
  children?: React.ReactNode
}

const colorConfig = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    title: 'text-red-900',
    desc: 'text-red-700',
    accent: 'bg-red-500',
    accentLight: 'bg-red-100 text-red-700',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    title: 'text-orange-900',
    desc: 'text-orange-700',
    accent: 'bg-orange-500',
    accentLight: 'bg-orange-100 text-orange-700',
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    title: 'text-yellow-900',
    desc: 'text-yellow-700',
    accent: 'bg-yellow-500',
    accentLight: 'bg-yellow-100 text-yellow-700',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    title: 'text-green-900',
    desc: 'text-green-700',
    accent: 'bg-green-500',
    accentLight: 'bg-green-100 text-green-700',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'text-blue-900',
    desc: 'text-blue-700',
    accent: 'bg-blue-500',
    accentLight: 'bg-blue-100 text-blue-700',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    title: 'text-indigo-900',
    desc: 'text-indigo-700',
    accent: 'bg-indigo-500',
    accentLight: 'bg-indigo-100 text-indigo-700',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    title: 'text-purple-900',
    desc: 'text-purple-700',
    accent: 'bg-purple-500',
    accentLight: 'bg-purple-100 text-purple-700',
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    title: 'text-pink-900',
    desc: 'text-pink-700',
    accent: 'bg-pink-500',
    accentLight: 'bg-pink-100 text-pink-700',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    title: 'text-slate-900',
    desc: 'text-slate-700',
    accent: 'bg-slate-500',
    accentLight: 'bg-slate-100 text-slate-700',
  },
}

export function ColorVariantCard({
  title,
  description,
  color = 'blue',
  className = '',
  children,
}: ColorVariantCardProps) {
  const config = colorConfig[color]

  return (
    <Card
      className={`${config.bg} border-2 ${config.border} overflow-hidden transition-all hover:shadow-md ${className}`}
    >
      <div className={`h-1 ${config.accent}`} />
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className={`${config.title} text-xl`}>{title}</CardTitle>
            {description && (
              <CardDescription className={`${config.desc} mt-2`}>
                {description}
              </CardDescription>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-lg ${config.accentLight} flex items-center justify-center flex-shrink-0`}
          >
            <div className={`w-6 h-6 rounded ${config.accent}`} />
          </div>
        </div>
      </CardHeader>
      {children && (
        <CardContent className={config.desc}>
          {children}
        </CardContent>
      )}
    </Card>
  )
}
