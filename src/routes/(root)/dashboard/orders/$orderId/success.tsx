import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { getOrderDetails } from '@/features/orders/actions/get-order-details.action'
import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Package, Home, Receipt, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

export const Route = createFileRoute(
  '/(root)/dashboard/orders/$orderId/success',
)({
  loader: async ({ params }) => {
    const orderId = Number(params.orderId)

    if (isNaN(orderId)) {
      throw redirect({ to: '/dashboard/orders' })
    }

    try {
      const order = await getOrderDetails({ data: { orderId } })

      // Only show success page for paid orders
      if (order.status !== 'paid') {
        throw redirect({
          to: `/dashboard/orders/$orderId`,
          params: { orderId: orderId.toString() },
        })
      }

      return order
    } catch {
      throw redirect({ to: '/dashboard/orders' })
    }
  },
  component: OrderSuccessPage,
  pendingComponent: () => {
    const { dir } = useI18n()
    return (
      <div className="container mx-auto px-4 py-16" dir={dir}>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  },
})

function OrderSuccessPage() {
  const { t, dir } = useI18n()
  const order = Route.useLoaderData()

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <CheckCircle className="h-20 w-20 text-green-600 animate-pulse" />
            <CheckCircle className="absolute h-20 w-20 text-green-600 animate-ping" />
          </div>
        </div>

        {/* Success Message */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              {t('orders.paymentSuccessful')}
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              {t('orders.thankYouOrder')}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Info */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('orders.orderNumber', { id: '' })}
                  </span>
                  <span className="font-semibold">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('orders.paymentDate')}
                  </span>
                  <span className="font-medium">
                    {order.paidAt && format(new Date(order.paidAt), 'PPP')}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">{t('orders.total')}</span>
                  <span className="font-bold" dir="ltr">
                    ${order.totalAmount}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t('orders.shippingTo')}
                </h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4">
                <h3 className="font-medium mb-2">{t('orders.whatNext')}</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('orders.confirmationEmail')}</li>
                  <li>• {t('orders.preparingOrder')}</li>
                  <li>• {t('orders.trackingInfo')}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/dashboard/orders/$orderId"
            params={{ orderId: order.id.toString() }}
            className="flex-1"
          >
            <Button variant="outline" className="w-full">
              <Receipt className="ms-2 h-4 w-4" />
              {t('orders.viewOrder')}
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button className="w-full">
              <Home className="ms-2 h-4 w-4" />
              {t('orders.continueShopping')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
