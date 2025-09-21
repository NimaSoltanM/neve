import {
  useOrderDetails,
  useProcessPayment,
  useCancelOrder,
} from '../hooks/use-orders'
import { useI18n } from '@/features/shared/i18n'
import { ORDER_STATUS_CONFIG } from '../types/order.types'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  Package,
  MapPin,
  Phone,
  User,
  CreditCard,
  X,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

interface OrderDetailProps {
  orderId: number
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const { t, dir, locale } = useI18n()
  const { data: order, isLoading } = useOrderDetails(orderId)
  const processPayment = useProcessPayment()
  const cancelOrder = useCancelOrder()
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)
    await processPayment.mutateAsync(orderId)
    setIsProcessing(false)
  }

  const handleCancel = async () => {
    if (window.confirm(t('orders.confirmCancel'))) {
      await cancelOrder.mutateAsync(orderId)
    }
  }

  if (isLoading) {
    return <OrderDetailSkeleton />
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {t('orders.notFound')}
          </p>
        </CardContent>
      </Card>
    )
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status]
  const statusIcon = {
    pending: <Clock className="h-4 w-4" />,
    paid: <CheckCircle className="h-4 w-4" />,
    completed: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
  }[order.status]

  return (
    <div dir={dir} className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('orders.orderNumber', { id: order.id })}
            </CardTitle>
            <Badge className={statusConfig.color}>
              <span className="flex items-center gap-1">
                {statusIcon}
                {statusConfig.label[locale as 'en' | 'fa']}
              </span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.createdAt), 'PPP')}
          </p>
        </CardHeader>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('orders.shippingAddress')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{order.shippingAddress.fullName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span dir="ltr">{order.shippingAddress.phoneNumber}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city} -{' '}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orders.items')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id}>
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-muted">
                  {item.productSnapshot.images?.[0] ? (
                    <img
                      src={item.productSnapshot.images[0]}
                      alt={item.productSnapshot.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Package className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {item.isAuctionWin === 1 && (
                    <Badge
                      className="absolute top-1 start-1"
                      variant="secondary"
                    >
                      {t('orders.auctionWin')}
                    </Badge>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{item.productSnapshot.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('orders.soldBy')}: {item.shop.name}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>
                      {t('orders.quantity')}: {item.quantity}
                    </span>
                    <span dir="ltr">${item.unitPrice}</span>
                  </div>
                </div>

                {/* Item Total */}
                <div className="text-end">
                  <p className="font-semibold" dir="ltr">
                    ${item.totalPrice}
                  </p>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}

          {/* Order Total */}
          <div className="flex justify-between pt-4">
            <span className="text-lg font-semibold">{t('orders.total')}</span>
            <span className="text-lg font-semibold" dir="ltr">
              ${order.totalAmount}
            </span>
          </div>
        </CardContent>

        {/* Actions */}
        {order.status === 'pending' && (
          <CardFooter className="gap-2">
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                  {t('orders.processing')}
                </>
              ) : (
                <>
                  <CreditCard className="ms-2 h-4 w-4" />
                  {t('orders.payNow')}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={cancelOrder.isPending}
            >
              {cancelOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="ms-2 h-4 w-4" />
                  {t('orders.cancel')}
                </>
              )}
            </Button>
          </CardFooter>
        )}

        {order.status === 'paid' && order.paidAt && (
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              {t('orders.paidAt')}: {format(new Date(order.paidAt), 'PPP')}
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-6 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    </div>
  )
}
