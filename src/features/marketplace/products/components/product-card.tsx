import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/features/shared/i18n'
import { ShoppingCart, Gavel, Clock, Store, CheckCircle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatPrice, cn } from '@/lib/utils'
import { useCountdown } from '../hooks/use-countdown'
import { useLiveProduct } from '../hooks/use-live-product'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'

// Define bid type
type BidType = {
  id: number
  userId: string
  isWinning: boolean
}

// Define complete product type
type ProductType = {
  id: number
  name: string
  slug: string
  description: string | null
  type: 'regular' | 'auction'
  price: string | null
  stock: number | null
  currentBid: string | null
  startingPrice: string | null
  buyNowPrice: string | null
  bidIncrement: string | null
  auctionEndsAt: Date | string | null
  images: string[] | any
  shop: {
    id: number
    name: string
    slug: string
  }
  bids?: BidType[]
}

interface ProductCardProps {
  product: ProductType
  onAddToCart?: () => void
  onPlaceBid?: () => void
}

export function ProductCard({
  product: initialProduct,
  onAddToCart,
  onPlaceBid,
}: ProductCardProps) {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const [hasNewBid, setHasNewBid] = useState(false)

  // Parse images if it's a JSON string
  const parseImages = (images: any): string[] => {
    if (Array.isArray(images)) return images
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  // Parse date
  const parseDate = (date: Date | string | null): Date | null => {
    if (!date) return null
    if (date instanceof Date) return date
    return new Date(date)
  }

  const productWithParsedData: ProductType = {
    ...initialProduct,
    images: parseImages(initialProduct.images),
    auctionEndsAt: parseDate(initialProduct.auctionEndsAt),
  }

  const liveProductInput = {
    slug: productWithParsedData.slug,
    type: productWithParsedData.type,
    auctionEndsAt: parseDate(initialProduct.auctionEndsAt),
  }

  const { data: liveProduct } = useLiveProduct(liveProductInput)

  const product: ProductType = liveProduct
    ? {
        ...liveProduct,
        images: parseImages(liveProduct.images),
        auctionEndsAt: parseDate(liveProduct.auctionEndsAt),
        bids: (liveProduct as any).bids || initialProduct.bids || [],
      }
    : productWithParsedData

  const auctionEndDate =
    product.auctionEndsAt instanceof Date ? product.auctionEndsAt : null
  const auctionEnded = auctionEndDate ? new Date() > auctionEndDate : false
  const timeLeft = useCountdown(auctionEndDate)

  const isAuction = product.type === 'auction'
  const images = Array.isArray(product.images) ? product.images : []
  const mainImage = images[0] || '/placeholder.jpg'
  const hasStock =
    product.stock !== null && product.stock !== undefined && product.stock > 0
  const bidCount = product.bids?.length || 0

  const isUserWinning = Boolean(
    user &&
      product.bids?.some(
        (bid: BidType) => bid.userId === user.id && bid.isWinning,
      ),
  )

  const prevWinningRef = useRef<boolean | null>(null)

  useEffect(() => {
    if (!liveProduct) return

    const liveProductWithBids = liveProduct as any
    const stillWinning = liveProductWithBids.bids?.some(
      (bid: BidType) => bid.userId === user?.id && bid.isWinning,
    )

    // Compare with previous state instead of initialProduct
    if (prevWinningRef.current === true && stillWinning === false) {
      toast.error(t('marketplace.youWereOutbid'))
    }

    prevWinningRef.current = stillWinning

    if (initialProduct.currentBid !== liveProduct.currentBid) {
      setHasNewBid(true)
      const timeout = setTimeout(() => setHasNewBid(false), 3000)
      return () => clearTimeout(timeout)
    }
  }, [liveProduct, user?.id, t, initialProduct.currentBid])

  const formatLocalizedPrice = (price: string | number | null): string => {
    if (price === null || price === undefined)
      return formatPrice(0, { locale: locale as 'en' | 'fa' })
    return formatPrice(price, { locale: locale as 'en' | 'fa' })
  }

  const handlePlaceBid = () => {
    if (!user) {
      toast.error(t('marketplace.loginToBid'))
      return
    }
    if (auctionEnded) {
      toast.error(t('marketplace.auctionEnded'))
      return
    }
    onPlaceBid?.()
  }

  const handleBuyNow = () => {
    if (!user) {
      toast.error(t('marketplace.loginToBuy'))
      return
    }
    if (auctionEnded) {
      toast.error(t('marketplace.auctionEnded'))
      return
    }
    onAddToCart?.()
  }

  const handleAddToCart = () => {
    if (!hasStock) {
      toast.error(t('marketplace.outOfStock'))
      return
    }
    onAddToCart?.()
  }

  return (
    <Card
      className={cn(
        'flex flex-col h-full transition-shadow hover:shadow-lg',
        isAuction &&
          'border-amber-300 dark:border-amber-400 border-2 bg-gradient-to-b from-amber-50/40 to-background dark:from-amber-950/10',
        auctionEnded && 'opacity-75',
      )}
    >
      {/* Image */}
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-lg">
        <img
          src={mainImage}
          className={cn(
            'w-full h-full object-cover transition-transform hover:scale-105',
            auctionEnded && 'opacity-70',
          )}
          alt={product.name}
        />
      </div>

      {/* Header */}
      <CardHeader>
        <CardTitle className="text-base font-semibold line-clamp-1 flex items-center gap-2">
          {isAuction && <Gavel className="w-4 h-4 text-amber-500 shrink-0" />}
          {product.name}
        </CardTitle>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 px-3 pb-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Store className="w-3 h-3 shrink-0" />
          <Link
            to="/shops/$slug"
            params={{ slug: product.shop.slug }}
            search={{ page: 1 }}
            className="truncate hover:text-foreground transition-colors"
          >
            {product.shop.name}
          </Link>
        </div>

        {isAuction ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {bidCount > 0
                  ? t('marketplace.currentBid')
                  : t('marketplace.startingPrice')}
              </span>
              <span
                className={cn(
                  'text-lg font-bold transition-colors',
                  hasNewBid
                    ? 'text-destructive animate-pulse'
                    : 'text-amber-600 dark:text-amber-400',
                )}
              >
                {formatLocalizedPrice(
                  product.currentBid || product.startingPrice,
                )}
              </span>
            </div>
            {bidCount > 0 && (
              <div className="text-xs text-muted-foreground">
                {bidCount} {t('marketplace.bids')}
              </div>
            )}
            {timeLeft && !auctionEnded && (
              <Badge
                variant="outline"
                className="gap-1 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
              >
                <Clock className="w-3 h-3" />
                {timeLeft}
              </Badge>
            )}
            {product.buyNowPrice && !auctionEnded && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {t('marketplace.buyNow')}:
                </span>
                <span className="font-semibold">
                  {formatLocalizedPrice(product.buyNowPrice)}
                </span>
              </div>
            )}
            {isUserWinning && !auctionEnded && (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="w-3 h-3" />
                {t('marketplace.winning')}
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold">
              {formatLocalizedPrice(product.price)}
            </span>
            {hasStock ? (
              <Badge variant="secondary" className="text-xs">
                {product.stock} {t('marketplace.inStock')}
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">
                {t('marketplace.outOfStock')}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-3 pt-0 flex gap-2">
        {isAuction ? (
          <>
            <Button
              variant={auctionEnded ? 'secondary' : 'default'}
              size="sm"
              className="flex-1 gap-2"
              onClick={handlePlaceBid}
              disabled={auctionEnded || isUserWinning}
            >
              <Gavel className="w-4 h-4" />
              {auctionEnded
                ? t('marketplace.ended')
                : isUserWinning
                  ? t('marketplace.youAreWinning')
                  : t('marketplace.placeBid')}
            </Button>
            {product.buyNowPrice && !auctionEnded && (
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={handleBuyNow}
              >
                {t('marketplace.buyNow')}
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={!hasStock}
          >
            <ShoppingCart className="w-4 h-4" />
            {hasStock
              ? t('marketplace.addToCart')
              : t('marketplace.outOfStock')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
