import { createFileRoute, redirect } from '@tanstack/react-router'
import { getOrderDetails } from '@/features/orders/actions/get-order-details.action'
import { OrderDetail } from '@/features/orders/components/order-detail'
import { useI18n } from '@/features/shared/i18n'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/(root)/dashboard/orders/$orderId/')({
  loader: async ({ params }) => {
    const orderId = Number(params.orderId)

    if (isNaN(orderId)) {
      throw redirect({ to: '/' })
    }

    try {
      const order = await getOrderDetails({ data: { orderId } })
      return order
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: OrderDetailPage,
  pendingComponent: OrderPending,
})

function OrderPending() {
  const { dir } = useI18n()

  return (
    <div className="container mx-auto px-4 py-16" dir={dir}>
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </div>
  )
}

function OrderDetailPage() {
  const { dir } = useI18n()
  const order = Route.useLoaderData()

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <div className="max-w-4xl mx-auto">
        <OrderDetail orderId={order.id} />
      </div>
    </div>
  )
}
