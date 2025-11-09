import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Star } from 'lucide-react'

interface ProductCardProps {
  image: string
  imageAlt?: string
  title: string
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  description?: string
  badge?: string
  badgeVariant?: 'sale' | 'new' | 'featured'
  onAddToCart?: () => void
  onFavorite?: () => void
  isFavorited?: boolean
  className?: string
}

const badgeStyles = {
  sale: 'bg-red-500',
  new: 'bg-green-500',
  featured: 'bg-purple-500',
}

export function ProductCard({
  image,
  imageAlt,
  title,
  price,
  originalPrice,
  rating,
  reviewCount,
  description,
  badge,
  badgeVariant = 'sale',
  onAddToCart,
  onFavorite,
  isFavorited = false,
  className = '',
}: ProductCardProps) {
  const discount =
    originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : null

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${className}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden bg-slate-100 h-48">
        <img
          src={image}
          alt={imageAlt || title}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        {/* Badge */}
        {badge && (
          <div
            className={`absolute top-3 right-3 ${badgeStyles[badgeVariant]} text-white px-3 py-1 rounded-full text-sm font-semibold`}
          >
            {badge}
          </div>
        )}
        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
            -{discount}%
          </div>
        )}
        {/* Favorite Button */}
        <button
          onClick={onFavorite}
          className="absolute bottom-3 right-3 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-all"
        >
          <Heart
            className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'}`}
          />
        </button>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{title}</CardTitle>
        {/* Rating */}
        {rating !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            {reviewCount && (
              <CardDescription className="text-xs">
                ({reviewCount})
              </CardDescription>
            )}
          </div>
        )}
        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl font-bold text-slate-900">${price}</span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-slate-500 line-through">
              ${originalPrice}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-4">{description}</p>
        )}
        <Button
          onClick={onAddToCart}
          className="w-full gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )
}
