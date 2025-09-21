import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { useOrders } from '@/features/orders/hooks/use-orders'
import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ORDER_STATUS_CONFIG } from '@/features/orders/types/order.types'
import { Package, Calendar, ChevronRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute('/(root)/(marketplace)/dashboard/orders/')(
  {
    beforeLoad: async () => {
      const { isAuthenticated } = await getCurrentUser()

      if (!isAuthenticated) {
        throw redirect({
          to: '/auth',
          search: {
            callbackUrl: '/orders',
          },
        })
      }
    },
    component: OrdersListPage,
  },
)

function OrdersListPage() {
  const { t, dir, locale } = useI18n()
  const { data, isLoading } = useOrders()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16" dir={dir}>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  const orders = data?.orders || []

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <h1 className="text-3xl font-bold mb-8">{t('orders.myOrders')}</h1>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">
                {t('orders.noOrders')}
              </p>
              <Link to="/marketplace" search={{ page: 1 }}>
                <Button>{t('orders.startShopping')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_CONFIG[order.status]
            const statusLabel =
              locale === 'fa' ? statusConfig.label.fa : statusConfig.label.en

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {t('orders.orderNumber', { id: order.id })}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Calendar className="inline h-3 w-3 me-1" />
                        {format(new Date(order.createdAt), 'PPP')}
                      </p>
                    </div>
                    <Badge className={statusConfig.color}>{statusLabel}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t('orders.items')}: {order.items.length}
                      </p>
                      <p className="font-semibold" dir="ltr">
                        ${order.totalAmount}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/orders/$orderId"
                      params={{ orderId: order.id.toString() }}
                    >
                      <Button variant="ghost" size="sm">
                        {t('orders.viewDetails')}
                        <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
