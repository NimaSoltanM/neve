import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'
import { useCountdown } from './use-countdown'
import { useLiveProduct } from './use-live-product'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useI18n } from '@/features/shared/i18n'
import { formatPrice } from '@/lib/utils'
import { parseProduct } from '../utils/parse-product'
import type { ProductType, BidType } from '../types'

export function useProductCard(initialProduct: ProductType) {
  const { t, locale } = useI18n()
  const { user } = useAuth()
  const router = useRouter()
  const [hasNewBid, setHasNewBid] = useState(false)
  const [showBidDialog, setShowBidDialog] = useState(false)
  const prevWinningRef = useRef<boolean | null>(null)

  // Parse + live product
  const parsedProduct = parseProduct(initialProduct)
  const { data: liveProduct } = useLiveProduct({
    slug: parsedProduct.slug,
    type: parsedProduct.type,
    auctionEndsAt: parsedProduct.auctionEndsAt,
  })

  const product: ProductType = liveProduct
    ? parseProduct({ ...liveProduct, bids: (liveProduct as any).bids || [] })
    : parsedProduct

  // Derived values
  const auctionEndDate =
    product.auctionEndsAt instanceof Date ? product.auctionEndsAt : null
  const auctionEnded = auctionEndDate ? new Date() > auctionEndDate : false
  const timeLeft = useCountdown(auctionEndDate)
  const isAuction = product.type === 'auction'
  const bidCount = product.bids?.length || 0
  const hasStock = (product.stock ?? 0) > 0
  const isUserWinning = Boolean(
    user && product.bids?.some((b) => b.userId === user.id && b.isWinning),
  )

  // Track outbid + new bids
  useEffect(() => {
    if (!liveProduct) return
    const stillWinning = (liveProduct as any).bids?.some(
      (b: BidType) => b.userId === user?.id && b.isWinning,
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

  const formatLocalizedPrice = (price: string | number | null) =>
    formatPrice(price ?? 0, { locale: locale as 'en' | 'fa' })

  // Actions
  const handlePlaceBid = () => {
    if (!user) {
      toast.error(t('marketplace.loginToBid'))
      router.navigate({
        to: '/auth',
        search: { callbackUrl: router.state.location.pathname },
      })
      return
    }
    if (auctionEnded) {
      toast.error(t('marketplace.auctionEnded'))
      return
    }
    setShowBidDialog(true)
  }

  return {
    product,
    t,
    router,
    hasNewBid,
    showBidDialog,
    setShowBidDialog,
    formatLocalizedPrice,
    handlePlaceBid,
    auctionEnded,
    timeLeft,
    isAuction,
    hasStock,
    bidCount,
    isUserWinning,
  }
}
