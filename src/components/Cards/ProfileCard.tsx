import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ProfileCardProps {
  avatar: string
  avatarAlt?: string
  name: string
  title: string
  description?: string
  socialLinks?: Array<{
    label: string
    icon: React.ReactNode
    href?: string
    onClick?: () => void
  }>
  actionButton?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  }
  className?: string
  layout?: 'vertical' | 'horizontal'
}

export function ProfileCard({
  avatar,
  avatarAlt,
  name,
  title,
  description,
  socialLinks,
  actionButton,
  className = '',
  layout = 'vertical',
}: ProfileCardProps) {
  const isVertical = layout === 'vertical'

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${className}`}>
      {isVertical ? (
        // Vertical Layout
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <img
              src={avatar}
              alt={avatarAlt || name}
              className="w-24 h-24 rounded-full object-cover border-4 border-slate-100"
            />
          </div>
          <CardTitle className="text-xl">{name}</CardTitle>
          <CardDescription className="text-sm font-semibold text-slate-600">
            {title}
          </CardDescription>
          {description && (
            <p className="text-sm text-slate-600 mt-3 leading-relaxed">
              {description}
            </p>
          )}
        </CardHeader>
      ) : (
        // Horizontal Layout
        <div className="flex gap-4 p-6">
          <img
            src={avatar}
            alt={avatarAlt || name}
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 flex-shrink-0"
          />
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription className="text-sm font-semibold text-slate-600">
              {title}
            </CardDescription>
            {description && (
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {(socialLinks || actionButton) && (
        <CardContent className={isVertical ? 'pb-6' : ''}>
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex justify-center gap-2 mb-4">
              {socialLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={link.onClick}
                  aria-label={link.label}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 hover:text-slate-900"
                >
                  {link.icon}
                </button>
              ))}
            </div>
          )}
          {actionButton && (
            <Button
              onClick={actionButton.onClick}
              variant={actionButton.variant || 'default'}
              className={isVertical ? 'w-full' : ''}
            >
              {actionButton.label}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  )
}
