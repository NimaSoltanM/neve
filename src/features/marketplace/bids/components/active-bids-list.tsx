import { useState } from 'react'
import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActiveBid {
  id: number
  productId: number
  productName: string
  productSlug: string
  productImage: string | null
  myBid: string
  currentBid: string | null
  minNextBid: number
  isWinning: boolean
  endsAt: Date | null
  timeLeft: number
}

interface ActiveBidsListProps {
  bids: ActiveBid[]
}

export function ActiveBidsList({ bids }: ActiveBidsListProps) {
  const { t, dir } = useI18n()
  const [rebidding, setRebidding] = useState<number | null>(null)

  if (bids.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{t('bids.empty.active')}</p>
          <Button asChild className="mt-4">
            <Link to="/marketplace" search={{ page: 1 }}>
              {t('bids.browseAuctions')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4" dir={dir}>
      {bids.map((bid) => (
        <Card key={bid.id}>
          <div className="flex items-center p-4 gap-4">
            <img
              src={bid.productImage || '/placeholder.png'}
              alt={bid.productName}
              className="h-20 w-20 object-cover rounded-md"
            />

            <div className="flex-1 min-w-0">
              <Link
                to="/categories"
                params={{ slug: bid.productSlug }}
                className="font-medium hover:underline truncate block"
              >
                {bid.productName}
              </Link>

              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-muted-foreground">
                  {t('bids.yourBid')}: <strong>${bid.myBid}</strong>
                </span>
                <span className="text-muted-foreground">
                  {t('bids.currentBid')}: <strong>${bid.currentBid}</strong>
                </span>
              </div>

              {bid.endsAt && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(bid.endsAt), {
                    addSuffix: true,
                  })}
                </div>
              )}
            </div>

            <div className="text-end">
              {bid.isWinning ? (
                <Badge className="bg-green-500">
                  {t('bids.status.winning')}
                </Badge>
              ) : (
                <>
                  <Badge variant="destructive">{t('bids.status.outbid')}</Badge>
                  <Button
                    size="sm"
                    className="mt-2"
                    disabled={rebidding === bid.id}
                  >
                    {t('bids.bidAgain')} ${bid.minNextBid.toFixed(2)}+
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
