// src/routes/shop/auctions/index.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { getMyShop } from '@/features/marketplace/shops/actions'
import { getShopAuctions } from '@/features/marketplace/shops/actions/get-shop-auctions.action'
import {
  endAuctionEarly,
  duplicateAuction,
} from '@/features/marketplace/shops/actions/manage-auction.action'
import { useI18n } from '@/features/shared/i18n'
import { useMutation } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link, useRouter } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import {
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  Users,
  AlertCircle,
  Eye,
  MoreVertical,
  Copy,
  XCircle,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/(dashboards)/shop/auctions/')({
  loader: async () => {
    const auctions = await getShopAuctions()
    return {
      data: auctions.success
        ? auctions.data
        : { active: [], ended: [], stats: null },
    }
  },
  component: ShopAuctionsComponent,
})

function ShopAuctionsComponent() {
  const { data } = Route.useLoaderData()
  const { t, dir } = useI18n()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [filterStatus, setFilterStatus] = useState('all')

  const endAuctionMutation = useMutation({
    mutationFn: (productId: number) => endAuctionEarly({ data: productId }),
    onSuccess: () => {
      toast.success(t('shop.auctions.endedSuccessfully'))
      router.invalidate()
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (productId: number) => duplicateAuction({ data: productId }),
    onSuccess: () => {
      toast.success(t('shop.auctions.duplicated'))
      router.invalidate()
    },
  })

  // Filter and sort active auctions
  const filteredActive = useMemo(() => {
    if (!data) return []

    let filtered = data.active.filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'ending':
          return a.timeLeft - b.timeLeft
        case 'price':
          return (
            parseFloat(b.currentBid || '0') - parseFloat(a.currentBid || '0')
          )
        case 'bids':
          return b.bidCount - a.bidCount
        default:
          return 0
      }
    })

    return filtered
  }, [data, searchTerm, sortBy])

  // Filter ended auctions
  const filteredEnded = useMemo(() => {
    if (!data) return []

    let filtered = data.ended.filter((a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (filterStatus !== 'all') {
      filtered = filtered.filter((a) => a.status === filterStatus)
    }

    return filtered
  }, [data, searchTerm, filterStatus])

  const handleBulkAction = (action: string) => {
    if (selectedIds.size === 0) return

    if (action === 'end') {
      selectedIds.forEach((id) => {
        endAuctionMutation.mutate(id)
      })
    }
    setSelectedIds(new Set())
  }

  const exportData = () => {
    if (!data) return

    const csv = [
      ['Name', 'Status', 'Current Bid', 'Bids', 'Winner'],
      ...data.active.map((a) => [
        a.name,
        'Active',
        a.currentBid || '0',
        a.bidCount.toString(),
        '',
      ]),
      ...data.ended.map((a) => [
        a.name,
        a.status,
        a.finalPrice || '0',
        '',
        a.winner?.name || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'auctions.csv'
    a.click()
  }

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div dir={dir} className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('shop.auctions.title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 me-2" />
            {t('shop.auctions.export')}
          </Button>
          <Button asChild>
            <Link to="/shop/products/new">{t('shop.auctions.createNew')}</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {data.stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('shop.auctions.stats.active')}
              </CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.stats.active}</div>
              <Progress
                value={
                  data.stats.total
                    ? (data.stats.active / data.stats.total) * 100
                    : 0
                }
                className="h-1 mt-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('shop.auctions.stats.awaiting')}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.ended.filter((a) => a.status === 'ended').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('shop.auctions.stats.paid')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.ended.filter((a) => a.status === 'paid').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('shop.auctions.stats.revenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data.stats.revenue.toFixed(0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('shop.auctions.stats.avgBids')}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.stats.total
                  ? Math.round(data.stats.recentBids / data.stats.total)
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('shop.auctions.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ps-9"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              {t('shop.auctions.sort.newest')}
            </SelectItem>
            <SelectItem value="ending">
              {t('shop.auctions.sort.ending')}
            </SelectItem>
            <SelectItem value="price">
              {t('shop.auctions.sort.price')}
            </SelectItem>
            <SelectItem value="bids">{t('shop.auctions.sort.bids')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            {t('shop.auctions.active')} ({data.active.length})
          </TabsTrigger>
          <TabsTrigger value="ended">
            {t('shop.auctions.ended')} ({data.ended.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <span className="text-sm">
                {selectedIds.size} {t('shop.auctions.selected')}
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleBulkAction('end')}
              >
                {t('shop.auctions.endSelected')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedIds(new Set())}
              >
                {t('shop.auctions.clearSelection')}
              </Button>
            </div>
          )}

          {filteredActive.map((auction) => (
            <Card key={auction.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                <Checkbox
                  checked={selectedIds.has(auction.id)}
                  onCheckedChange={(checked) => {
                    const newIds = new Set(selectedIds)
                    if (checked) newIds.add(auction.id)
                    else newIds.delete(auction.id)
                    setSelectedIds(newIds)
                  }}
                />

                {auction.image && (
                  <img
                    src={auction.image}
                    alt={auction.name}
                    className="h-24 w-24 object-cover rounded-md"
                  />
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold hover:underline text-lg">
                        {auction.name}
                      </p>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        <span>
                          {auction.bidCount} {t('shop.auctions.bids')}
                        </span>
                        <span>
                          ${auction.currentBid || auction.startingPrice}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <p>
                            <Eye className="h-4 w-4 me-2" />
                            {t('shop.auctions.view')}
                          </p>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => duplicateMutation.mutate(auction.id)}
                        >
                          <Copy className="h-4 w-4 me-2" />
                          {t('shop.auctions.duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => endAuctionMutation.mutate(auction.id)}
                        >
                          <XCircle className="h-4 w-4 me-2" />
                          {t('shop.auctions.endEarly')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Progress
                    value={
                      100 - (auction.timeLeft / (7 * 24 * 60 * 60 * 1000)) * 100
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ended" className="space-y-4">
          {filteredEnded.map((auction) => (
            <Card key={auction.id} className="overflow-hidden">
              <div className="flex gap-4 p-4">
                {auction.image && (
                  <img
                    src={auction.image}
                    alt={auction.name}
                    className="h-20 w-20 object-cover rounded-md opacity-75"
                  />
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium hover:underline">
                        {auction.name}
                      </p>

                      <div className="text-sm text-muted-foreground mt-1">
                        {auction.winner ? (
                          <>
                            ${auction.finalPrice} • {auction.winner.name}
                          </>
                        ) : (
                          t('shop.auctions.noBids')
                        )}
                      </div>
                    </div>

                    <Badge
                      variant={
                        auction.status === 'paid'
                          ? 'default'
                          : auction.isPastDeadline
                            ? 'destructive'
                            : 'outline'
                      }
                    >
                      {t(`shop.auctions.status.${auction.status}`)}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
