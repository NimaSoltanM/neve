import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useI18n } from '@/features/shared/i18n'
import { formatPrice } from '@/lib/utils'
import { Gavel, Plus, AlertCircle } from 'lucide-react'
import { placeBid } from '@/features/marketplace/bids/actions'
import { toast } from 'sonner'

interface PlaceBidModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: {
    id: number
    name: string
    currentBid?: string | null
    startingPrice?: string | null
    bidIncrement?: string | null
    buyNowPrice?: string | null
  }
  onSuccess?: () => void
}

export function PlaceBidModal({
  open,
  onOpenChange,
  product,
  onSuccess,
}: PlaceBidModalProps) {
  const { t, locale } = useI18n()
  const [bidAmount, setBidAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const currentBid = parseFloat(
    product.currentBid || product.startingPrice || '0',
  )
  const increment = parseFloat(product.bidIncrement || '1')
  const minBid = currentBid + increment

  const formatLocalizedPrice = (price: string | number) => {
    return formatPrice(price, { locale: locale as 'en' | 'fa' })
  }

  const quickBidOptions = [
    minBid,
    minBid + increment * 5,
    minBid + increment * 10,
  ]

  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount)

    if (isNaN(amount) || amount < minBid) {
      toast.error(t('marketplace.bidTooLow'))
      return
    }

    setIsLoading(true)

    try {
      const result = await placeBid({
        data: {
          productId: product.id,
          amount: bidAmount,
        },
      })

      if (result.success) {
        toast.success(t('marketplace.bidPlaced'))
        onSuccess?.()
        onOpenChange(false)
        setBidAmount('')
      } else {
        toast.error(result.error || t('marketplace.bidFailed'))
      }
    } catch (error) {
      toast.error(t('marketplace.bidFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5" />
            {t('marketplace.placeBid')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <h3 className="font-medium mb-1">{product.name}</h3>
            <p className="text-sm text-muted-foreground">
              {t('marketplace.currentBid')}: {formatLocalizedPrice(currentBid)}
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('marketplace.minimumBid')}: {formatLocalizedPrice(minBid)}
            </AlertDescription>
          </Alert>

          {/* Quick bid buttons */}
          <div className="space-y-2">
            <Label>{t('marketplace.quickBid')}</Label>
            <div className="flex gap-2">
              {quickBidOptions.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setBidAmount(amount.toFixed(2))}
                  className="flex-1"
                >
                  <Plus className="w-3 h-3 me-1" />
                  {formatLocalizedPrice(amount)}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom bid amount */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount">{t('marketplace.yourBid')}</Label>
            <Input
              id="bidAmount"
              type="number"
              step="0.01"
              min={minBid}
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={minBid.toFixed(2)}
            />
          </div>

          {product.buyNowPrice && (
            <Alert>
              <AlertDescription>
                {t('marketplace.buyNowAvailable')}:{' '}
                {formatLocalizedPrice(product.buyNowPrice)}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handlePlaceBid}
            disabled={isLoading || !bidAmount || parseFloat(bidAmount) < minBid}
          >
            <Gavel className="w-4 h-4 me-2" />
            {t('marketplace.confirmBid')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
