import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/features/shared/i18n'
import {
  ShoppingCart,
  Gavel,
  Clock,
  Store,
  CheckCircle,
  Zap,
} from 'lucide-react'
import { Link, useRouter } from '@tanstack/react-router'
import { formatPrice, cn } from '@/lib/utils'
import { useCountdown } from '../hooks/use-countdown'
import { useLiveProduct } from '../hooks/use-live-product'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { PlaceBidModal } from '../../bids/components/place-bid-modal'

// Types
type BidType = {
  id: number
  userId: string
  isWinning: boolean
}

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
  onAddToCart?: (productId: number) => void
}

export function ProductCard({
  product: initialProduct,
  onAddToCart,
}: ProductCardProps) {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const [hasNewBid, setHasNewBid] = useState(false)
  const [showBidDialog, setShowBidDialog] = useState(false)
  const router = useRouter()

  // Parse helpers
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

  const parseDate = (date: Date | string | null): Date | null => {
    if (!date) return null
    if (date instanceof Date) return date
    return new Date(date)
  }

  // Process product data
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

  // Computed values
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

  // Track winning status changes
  const prevWinningRef = useRef<boolean | null>(null)
  useEffect(() => {
    if (!liveProduct) return
    const liveProductWithBids = liveProduct as any
    const stillWinning = liveProductWithBids.bids?.some(
      (bid: BidType) => bid.userId === user?.id && bid.isWinning,
    )
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
    setShowBidDialog(true)
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
    onAddToCart?.(product.id)
    toast.success(t('marketplace.addedToCart'))
  }

  const handleAddToCart = () => {
    if (!user) {
      toast.error(t('marketplace.loginToBuy'))
      return
    }
    if (!hasStock) {
      toast.error(t('marketplace.outOfStock'))
      return
    }
    onAddToCart?.(product.id)
    toast.success(t('marketplace.addedToCart'))
  }

  return (
    <>
      <Card
        className={cn(
          'group flex flex-col h-full overflow-hidden transition-all hover:shadow-xl',
          isAuction && !auctionEnded && 'ring-2 ring-amber-400/50',
          auctionEnded && 'opacity-80',
        )}
      >
        {/* Image with badges */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={mainImage}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            alt={product.name}
          />

          {/* Status badges */}
          <div className="absolute top-2 start-2 end-2 flex justify-between items-start">
            <div className="flex flex-col gap-2">
              {isAuction && (
                <Badge
                  className={cn(
                    'gap-1 shadow-lg',
                    auctionEnded
                      ? 'bg-gray-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 border-0',
                  )}
                >
                  <Gavel className="w-3 h-3" />
                  {auctionEnded
                    ? t('marketplace.ended')
                    : t('marketplace.auction')}
                </Badge>
              )}
              {!isAuction && !hasStock && (
                <Badge variant="destructive" className="shadow-lg">
                  {t('marketplace.outOfStock')}
                </Badge>
              )}
            </div>

            {isAuction && !auctionEnded && timeLeft && (
              <Badge
                variant="secondary"
                className="gap-1 shadow-lg backdrop-blur bg-background/80"
              >
                <Clock className="w-3 h-3" />
                {timeLeft}
              </Badge>
            )}
          </div>

          {/* Winning indicator */}
          {isUserWinning && !auctionEnded && (
            <div className="absolute bottom-2 start-2 end-2">
              <Badge className="w-full justify-center gap-1 bg-green-500 text-white shadow-lg">
                <CheckCircle className="w-3 h-3" />
                {t('marketplace.youAreWinning')}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardHeader className="pb-3">
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Store className="w-3 h-3" />
            <Link
              to="/shops/$slug"
              params={{ slug: product.shop.slug }}
              search={{ page: 1 }}
              className="hover:text-foreground transition-colors"
            >
              {product.shop.name}
            </Link>
          </div>
        </CardHeader>

        <CardContent className="flex-1 pb-4">
          {isAuction ? (
            <div className="space-y-3">
              {/* Current bid / Starting price */}
              <div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-muted-foreground">
                    {bidCount > 0
                      ? t('marketplace.currentBid')
                      : t('marketplace.startingPrice')}
                  </span>
                  {bidCount > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {bidCount} {t('marketplace.bids')}
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'text-2xl font-bold mt-1 transition-all',
                    hasNewBid && 'text-orange-500 animate-pulse scale-105',
                  )}
                >
                  {formatLocalizedPrice(
                    product.currentBid || product.startingPrice,
                  )}
                </div>
              </div>

              {/* Buy now option */}
              {product.buyNowPrice && !auctionEnded && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">
                    {t('marketplace.buyNow')}:
                  </span>
                  <span className="text-sm font-semibold ms-auto">
                    {formatLocalizedPrice(product.buyNowPrice)}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-2xl font-bold">
                {formatLocalizedPrice(product.price)}
              </div>
              {hasStock && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  {product.stock} {t('marketplace.inStock')}
                </div>
              )}
            </div>
          )}
        </CardContent>

        {/* Actions */}
        <div className="p-4 pt-0 mt-auto">
          {isAuction ? (
            <div className="flex gap-2">
              <Button
                variant={
                  auctionEnded || isUserWinning ? 'secondary' : 'default'
                }
                size="sm"
                className="flex-1"
                onClick={handlePlaceBid}
                disabled={auctionEnded || isUserWinning}
              >
                <Gavel className="w-4 h-4 me-2" />
                {auctionEnded
                  ? t('marketplace.ended')
                  : isUserWinning
                    ? t('marketplace.winning')
                    : t('marketplace.placeBid')}
              </Button>
              {product.buyNowPrice && !auctionEnded && (
                <Button variant="outline" size="sm" onClick={handleBuyNow}>
                  <Zap className="w-4 h-4" />
                </Button>
              )}
            </div>
          ) : (
            <Button
              className="w-full"
              size="sm"
              onClick={handleAddToCart}
              disabled={!hasStock}
            >
              <ShoppingCart className="w-4 h-4 me-2" />
              {hasStock
                ? t('marketplace.addToCart')
                : t('marketplace.outOfStock')}
            </Button>
          )}
        </div>
      </Card>

      {isAuction && (
        <PlaceBidModal
          open={showBidDialog}
          onOpenChange={setShowBidDialog}
          product={product}
          onSuccess={() => {
            setShowBidDialog(false)
            toast.success(t('marketplace.bidPlaced'))
            router.invalidate()
          }}
        />
      )}
    </>
  )
}
