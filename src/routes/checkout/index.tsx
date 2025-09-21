import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { CheckoutForm } from '@/features/orders/components/checkout-form'
import { useCart } from '@/features/cart/hooks/use-cart'
import { useI18n } from '@/features/shared/i18n'

export const Route = createFileRoute('/checkout/')({
  beforeLoad: async () => {
    const { isAuthenticated } = await getCurrentUser()

    if (!isAuthenticated) {
      throw redirect({
        to: '/auth',
        search: {
          callbackUrl: '/checkout',
        },
      })
    }
  },
  component: CheckoutPage,
})

function CheckoutPage() {
  const { t, dir } = useI18n()
  const { itemCount } = useCart()

  if (itemCount === 0) {
    throw redirect({ to: '/' })
  }

  return (
    <div className="container mx-auto px-4 py-8" dir={dir}>
      <h1 className="text-3xl font-bold mb-8">{t('orders.checkout')}</h1>
      <div className="max-w-2xl mx-auto">
        <CheckoutForm
          onSuccess={(orderId) =>
            redirect({
              to: '/dashboard/orders/$orderId',
              params: { orderId: orderId.toString() },
            })
          }
        />
      </div>
    </div>
  )
}
