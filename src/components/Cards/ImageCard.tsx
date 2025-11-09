import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ImageCardProps {
  image: string
  title: string
  description?: string
  overlay?: boolean
  className?: string
}

export function ImageCard({
  image,
  title,
  description,
  overlay = false,
  className = '',
}: ImageCardProps) {
  if (overlay) {
    return (
      <div
        className={`rounded-lg overflow-hidden h-64 relative group ${className}`}
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          {description && <p className="text-sm text-slate-200">{description}</p>}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <img src={image} alt={title} className="w-full h-48 object-cover rounded-t-lg" />
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
    </Card>
  )
}
