import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BasicCardProps {
  title: string
  description: string
  className?: string
}

export function BasicCard({ title, description, className = '' }: BasicCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}
