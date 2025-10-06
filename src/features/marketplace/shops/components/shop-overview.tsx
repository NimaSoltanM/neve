import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useI18n } from '@/features/shared/i18n'
import { Link } from '@tanstack/react-router'
import {
  Package,
  Gavel,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
  BarChart3,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { getShopStats } from '../actions/get-shop-stats.action'
import { formatDistanceToNow } from 'date-fns'
import { enUS, faIR } from 'date-fns/locale'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function ShopOverview() {
  const { t, locale, dir } = useI18n()
  const dateLocale = locale === 'fa' ? faIR : enUS

  const { data, isLoading } = useQuery({
    queryKey: ['shop-stats'],
    queryFn: async () => {
      return getShopStats()
    },
  })

  if (isLoading) {
    return <ShopOverviewSkeleton />
  }

  const shop = data?.shop
  const stats = data?.stats
  const recentOrders = data?.recentOrders || []
  const topProducts = data?.topProducts || []
  const lowStockProducts = data?.lowStockProducts || []

  return (
    <div dir={dir} className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {t('shopOverview.welcome', { shopName: shop?.name || '' })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('dashboard.overview.quickStats')}
        </p>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.todaySales')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.todaySales || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.thisWeek')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.weekSales || '0'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.thisMonth')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.monthSales || '0'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalRevenue || '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.totalProducts')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalProducts || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.activeAuctions')}
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activeAuctions || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.pendingOrders')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.pendingOrders || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('shopOverview.lowStockAlerts')}: {lowStockProducts.length}{' '}
            {lowStockProducts.length === 1 ? 'product' : 'products'} running low
          </AlertDescription>
        </Alert>
      )}

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('shopOverview.recentOrders')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/shop/orders">
              {t('dashboard.overview.viewAll')}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('shopOverview.recentOrdersEmpty')}
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const firstItem = order.items[0]
                const itemsCount = order.items.length

                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-4 p-4 rounded-lg border"
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
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('shopOverview.topProducts')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/shop/products">
              {t('dashboard.overview.viewAll')}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('shopOverview.topProductsEmpty')}
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <Link
                  key={product.productId}
                  to="/products/$productSlug"
                  params={{ productSlug: product.productSlug }}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  {product.productImages[0] && (
                    <img
                      src={product.productImages[0]}
                      alt={product.productName}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {product.productName}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>
                        {product.sales} {t('shopOverview.sales')}
                      </span>
                      <span>•</span>
                      <span>${product.revenue}</span>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('shopOverview.lowStockAlerts')}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/shop/products">
                {t('dashboard.overview.viewAll')}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  to="/shop/products"
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
                    <p className="text-sm text-muted-foreground">
                      {product.stock === 0
                        ? t('shopOverview.outOfStock')
                        : t('shopOverview.inStock', {
                            count: product.stock || 0,
                          })}
                    </p>
                  </div>
                  <Badge
                    variant={product.stock === 0 ? 'destructive' : 'secondary'}
                  >
                    {product.stock || 0}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('shopOverview.quickActions')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/shop/products/new">
              <Plus className="me-2 h-4 w-4" />
              {t('shopOverview.addProduct')}
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/shop/auctions">
              <Gavel className="me-2 h-4 w-4" />
              {t('shopOverview.createAuction')}
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link to="/shop/analytics">
              <BarChart3 className="me-2 h-4 w-4" />
              {t('shopOverview.viewAnalytics')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ShopOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      {/* Revenue Stats Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Metrics Skeleton */}
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

      {/* Top Products Skeleton */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-40" />
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
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-5" />
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
