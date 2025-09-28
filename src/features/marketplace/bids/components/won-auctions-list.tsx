import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { ShoppingCart, AlertTriangle, Clock } from 'lucide-react'

interface WonAuction {
  id: number
  name: string
  slug: string
  image: string | null
  winningBid: string | null
  shopName: string | null
  endedAt: Date | null
  paymentDeadline: Date | null
  hoursLeft: number
  inCart: boolean
  isOverdue: boolean
}

interface WonAuctionsListProps {
  auctions: {
    pending: WonAuction[]
    overdue: WonAuction[]
  }
}

export function WonAuctionsList({ auctions }: WonAuctionsListProps) {
  const { t, dir } = useI18n()

  if (auctions.pending.length === 0 && auctions.overdue.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">{t('bids.empty.won')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6" dir={dir}>
      {auctions.overdue.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('bids.overduePayment')}</AlertTitle>
          <AlertDescription>{t('bids.overdueDescription')}</AlertDescription>
        </Alert>
      )}

      {auctions.pending.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">{t('bids.pendingPayment')}</h3>
          {auctions.pending.map((auction) => (
            <Card key={auction.id}>
              <div className="flex items-center p-4 gap-4">
                <img
                  src={auction.image || '/placeholder.png'}
                  alt={auction.name}
                  className="h-20 w-20 object-cover rounded-md"
                />

                <div className="flex-1">
                  <Link
                    to="/products/$slug"
                    params={{ slug: auction.slug }}
                    className="font-medium hover:underline"
                  >
                    {auction.name}
                  </Link>

                  <p className="text-sm text-muted-foreground mt-1">
                    {t('bids.wonFor')}: <strong>${auction.winningBid}</strong>
                  </p>

                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span className="text-sm text-orange-500">
                      {auction.hoursLeft}h {t('bids.remaining')}
                    </span>
                  </div>
                </div>

                <div>
                  {auction.inCart ? (
                    <Button asChild>
                      <Link to="/cart">
                        <ShoppingCart className="h-4 w-4 me-2" />
                        {t('bids.checkout')}
                      </Link>
                    </Button>
                  ) : (
                    <Badge variant="secondary">{t('bids.inCart')}</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
