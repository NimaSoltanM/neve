import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useI18n } from '@/features/shared/i18n'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getShopDashboardStats } from '../actions/get-shop-dashboard-stats.action'
import { getMyShop } from '../actions'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign,
  Package,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Plus,
  BarChart3,
  ArrowRight,
  Gavel,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { enUS, faIR } from 'date-fns/locale'

export function ShopOverview() {
  const { t, locale, dir } = useI18n()
  const dateLocale = locale === 'fa' ? faIR : enUS

  const { data: shopData } = useQuery({
    queryKey: ['shop'],
    queryFn: async () => getMyShop(),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['shop-dashboard-stats'],
    queryFn: async () => getShopDashboardStats(),
  })

  if (isLoading) {
    return <ShopOverviewSkeleton />
  }

  if (!data?.success || !data.data) {
    return null
  }

  const { stats, recentOrders, topProducts, lowStockProducts } = data.data

  const formatLocalPrice = (price: string | number) => {
    return formatPrice(price, { locale })
  }

  return (
    <div dir={dir} className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {t('shopOverview.welcome', { shopName: shopData?.data?.name || '' })}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('shopOverview.todaySales')}: {formatLocalPrice(stats.todaySales)}
        </p>
      </div>

      {shopData?.data?.isActive === false && (
        <Alert
          variant="destructive"
          className="border-amber-500 bg-amber-50 dark:bg-amber-950/20"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{t('shops.shopInactiveWarning')}</p>
              <p className="text-sm mt-1">{t('shops.shopInactiveAlertDesc')}</p>
            </div>
            <Button asChild variant="default" size="sm" className="shrink-0">
              <Link to="/shop/settings">
                {t('shops.goToSettings')}
                <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.thisWeek')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLocalPrice(stats.weekSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.thisMonth')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLocalPrice(stats.monthSales)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.totalRevenue')}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatLocalPrice(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.totalProducts')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.activeAuctions')}
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAuctions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('shopOverview.pendingOrders')}
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('shopOverview.recentOrders')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/shop/orders">
              {t('shopOverview.viewAll')}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('shopOverview.recentOrdersEmpty')}
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {order.customerPhone}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.itemsCount} {t('shopOverview.items')}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-sm font-bold">
                      {formatLocalPrice(order.totalAmount)}
                    </p>
                    <Badge
                      variant={
                        order.status === 'completed'
                          ? 'default'
                          : order.status === 'paid'
                            ? 'secondary'
                            : order.status === 'cancelled'
                              ? 'destructive'
                              : 'outline'
                      }
                      className="mt-1"
                    >
                      {t(`shopOverview.orderStatus.${order.status}`)}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                        locale: dateLocale,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('shopOverview.topProducts')}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/shop/products">
              {t('shopOverview.viewAll')}
              <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('shopOverview.topProductsEmpty')}
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-0"
                >
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {t('shopOverview.salesCount')}: {product.sales}
                      </span>
                      <span>
                        {product.stock > 0
                          ? t('shopOverview.stockCount', {
                              count: product.stock,
                            })
                          : t('shopOverview.outOfStock')}
                      </span>
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <p className="text-sm font-bold">
                      {formatLocalPrice(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {t('shopOverview.lowStockAlerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t('shopOverview.stockCount', { count: product.stock })}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="flex-shrink-0"
                  >
                    <Link
                      to="/shop/products/$productId/edit"
                      params={{ productId: product.id }}
                    >
                      {t('shopOverview.edit')}
                    </Link>
                  </Button>
                </div>
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
              {t('shopOverview.manageAuctions')}
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
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 mt-2" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
