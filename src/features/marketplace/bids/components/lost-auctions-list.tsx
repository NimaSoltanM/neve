// src/features/bids/components/lost-auctions-list.tsx

import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'

interface LostAuction {
  productId: number
  productName: string
  productSlug: string
  productImage: string | null
  finalPrice: string
  myHighestBid: string
  outbidBy: number
  endedAt: Date | null
  winnerName: string
}

interface LostAuctionsListProps {
  auctions: LostAuction[]
}

export function LostAuctionsList({ auctions }: LostAuctionsListProps) {
  const { t, dir } = useI18n()

  if (auctions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{t('bids.empty.lost')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" dir={dir}>
      {auctions.map((auction) => (
        <Card key={auction.productId}>
          <div className="flex items-center p-4 gap-4">
            <img
              src={auction.productImage || '/placeholder.png'}
              alt={auction.productName}
              className="h-16 w-16 object-cover rounded-md opacity-75"
            />

            <div className="flex-1">
              <Link
                to="/products/$productSlug"
                params={{ productSlug: auction.productSlug }}
                className="font-medium hover:underline text-muted-foreground"
              >
                {auction.productName}
              </Link>

              <div className="text-sm text-muted-foreground mt-1">
                <span>
                  {t('bids.yourBid')}: ${auction.myHighestBid}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {t('bids.soldFor')}: ${auction.finalPrice}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {t('bids.wonBy')}: {auction.winnerName}
                </span>
              </div>

              {auction.endedAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(auction.endedAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>

            <Button variant="outline" size="sm" asChild>
              <Link to="/products/$productSlug" params={{ productSlug: auction.productSlug }}>
                {t('bids.viewSimilar')}
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
