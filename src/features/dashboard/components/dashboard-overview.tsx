import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/features/shared/i18n'
import { Link } from '@tanstack/react-router'
import {
  Package,
  Gavel,
  Clock,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '../actions/get-dashboard-stats.action'
import { formatDistanceToNow } from 'date-fns'
import { enUS, faIR } from 'date-fns/locale'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'

export function DashboardOverview() {
  const { t, locale, dir } = useI18n()
  const dateLocale = locale === 'fa' ? faIR : enUS

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      return getDashboardStats()
    },
  })

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      return getCurrentUser()
    },
  })

  if (isLoading) {
    return <DashboardOverviewSkeleton />
  }

  const stats = data?.stats
  const recentOrders = data?.recentOrders || []
  const activeBids = data?.activeBids || []

  return (
    <div dir={dir} className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {t('dashboard.overview.welcome', { name: user?.user?.firstName! })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard.overview.quickStats')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.overview.totalOrders')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.overview.activeBids')}
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBids || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.overview.pendingPayments')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingPayments || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.overview.recentOrders')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/orders">
              {t('dashboard.overview.viewAll')}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('dashboard.overview.recentOrdersEmpty')}
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const firstItem = order.items[0]
                const itemsCount = order.items.length

                return (
                  <Link
                    key={order.id}
                    to="/dashboard/orders/$orderId"
                    params={{ orderId: order.id.toString() }}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {firstItem?.product.images[0] && (
                      <img
                        src={firstItem.product.images[0]}
                        alt={firstItem.product.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {t('orders.orderNumber', { id: order.id })}
                        </p>
                        <Badge
                          variant={
                            order.status === 'paid'
                              ? 'default'
                              : order.status === 'pending'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {itemsCount}{' '}
                        {itemsCount === 1
                          ? t('orders.items')
                          : t('orders.items')}{' '}
                        • ${order.totalAmount}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground text-end">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Bids */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('dashboard.overview.activeBidsSection')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/bids">
              {t('dashboard.overview.viewAll')}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {activeBids.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('dashboard.overview.activeBidsEmpty')}
            </div>
          ) : (
            <div className="space-y-4">
              {activeBids.map((bid) => {
                const product = bid.product
                const timeLeft = product.auctionEndsAt
                  ? formatDistanceToNow(new Date(product.auctionEndsAt), {
                      locale: dateLocale,
                    })
                  : ''

                return (
                  <Link
                    key={bid.id}
                    to="/products/$productSlug"
                    params={{ productSlug: product.slug }}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    {product.images[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-16 h-16 rounded-md object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {t('cart.yourBid')} ${bid.amount}
                        </p>
                        {bid.isWinning && (
                          <Badge variant="default" className="gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Winning
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground text-end">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {t('dashboard.overview.endingSoon', { time: timeLeft })}
                      </div>
                      <p className="mt-1">${product.currentBid}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.overview.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/marketplace" search={{ page: 1 }}>
              <ShoppingBag className="me-2 h-4 w-4" />
              {t('dashboard.overview.browseMarketplace')}
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/dashboard/orders">
              <Package className="me-2 h-4 w-4" />
              {t('dashboard.overview.viewAllOrders')}
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/dashboard/bids">
              <Gavel className="me-2 h-4 w-4" />
              {t('dashboard.overview.checkBids')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg border"
              >
                <Skeleton className="w-16 h-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Bids Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-lg border"
              >
                <Skeleton className="w-16 h-16 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
