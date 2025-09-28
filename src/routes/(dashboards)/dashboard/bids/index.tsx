import { createFileRoute, Await } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getBidStats } from '@/features/marketplace/bids/actions/get-bid-stats.action'
import { getActiveBids } from '@/features/marketplace/bids/actions/get-active-bids.action'
import { getWonAuctions } from '@/features/marketplace/bids/actions/get-won-auctions.action'
import { getLostAuctions } from '@/features/marketplace/bids/actions/get-lost-auctions.action'
import { BidStats } from '@/features/marketplace/bids/components/bid-stats'
import { ActiveBidsSkeleton } from '@/features/marketplace/bids/components/skeletons/active-bids-skeleton'
import { ActiveBidsList } from '@/features/marketplace/bids/components/active-bids-list'
import { WonAuctionsSkeleton } from '@/features/marketplace/bids/components/skeletons/won-auctions-skeleton'
import { WonAuctionsList } from '@/features/marketplace/bids/components/won-auctions-list'
import { LostAuctionsSkeleton } from '@/features/marketplace/bids/components/skeletons/lost-auctions-skeleton'
import { LostAuctionsList } from '@/features/marketplace/bids/components/lost-auctions-list'

export const Route = createFileRoute('/(dashboards)/dashboard/bids/')({
  loader: async () => {
    const stats = await getBidStats()

    return {
      stats: stats.success ? stats.data : null,
      deferredActiveBids: getActiveBids(),
      deferredWonAuctions: getWonAuctions(),
      deferredLostAuctions: getLostAuctions(),
    }
  },
  component: BidsPageComponent,
})

function BidsPageComponent() {
  const {
    stats,
    deferredActiveBids,
    deferredWonAuctions,
    deferredLostAuctions,
  } = Route.useLoaderData()
  const { t, dir } = useI18n()

  return (
    <div dir={dir} className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">{t('bids.title')}</h1>

      <BidStats stats={stats} />

      <Tabs defaultValue="active" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">{t('bids.tabs.active')}</TabsTrigger>
          <TabsTrigger value="won">{t('bids.tabs.won')}</TabsTrigger>
          <TabsTrigger value="lost">{t('bids.tabs.lost')}</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Await promise={deferredActiveBids} fallback={<ActiveBidsSkeleton />}>
            {(result) => (
              <ActiveBidsList
                bids={result.success && result.data ? result.data : []}
              />
            )}
          </Await>
        </TabsContent>

        <TabsContent value="won">
          <Await
            promise={deferredWonAuctions}
            fallback={<WonAuctionsSkeleton />}
          >
            {(result) => (
              <WonAuctionsList
                auctions={
                  result.success && result.data
                    ? result.data
                    : { pending: [], overdue: [] }
                }
              />
            )}
          </Await>
        </TabsContent>

        <TabsContent value="lost">
          <Await
            promise={deferredLostAuctions}
            fallback={<LostAuctionsSkeleton />}
          >
            {(result) => (
              <LostAuctionsList
                auctions={result.success && result.data ? result.data : []}
              />
            )}
          </Await>
        </TabsContent>
      </Tabs>
    </div>
  )
}
