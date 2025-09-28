import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Trophy, Clock, DollarSign } from 'lucide-react'

interface BidStatsProps {
  stats:
    | {
        totalBids: number
        totalAuctions: number
        activeBids: number
        wonAuctions: number
        totalSpent: number
      }
    | null
    | undefined
}

export function BidStats({ stats }: BidStatsProps) {
  const { t, dir } = useI18n()

  if (!stats) return null

  return (
    <div className="grid gap-4 md:grid-cols-4" dir={dir}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('bids.stats.activeBids')}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeBids}</div>
          <p className="text-xs text-muted-foreground">
            {t('bids.stats.currentlyBidding')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('bids.stats.wonAuctions')}
          </CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.wonAuctions}</div>
          <p className="text-xs text-muted-foreground">
            {t('bids.stats.totalWins')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('bids.stats.totalBids')}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBids}</div>
          <p className="text-xs text-muted-foreground">
            {t('bids.stats.last30Days')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('bids.stats.totalSpent')}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalSpent.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {t('bids.stats.paidAuctions')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
