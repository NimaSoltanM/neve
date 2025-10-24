import { createFileRoute, redirect } from '@tanstack/react-router'
import { ShopOrdersList } from '@/features/orders/components/shop-orders-list'
import { getUserShops } from '@/features/marketplace/products/actions/product-management.actions'

export const Route = createFileRoute('/(dashboards)/shop/orders/')({
  beforeLoad: async () => {
    const shop = await getUserShops()

    if (!shop) {
      throw redirect({
        to: '/dashboard/shop-setup',
      })
    }
  },
  component: ShopOrdersPage,
})

function ShopOrdersPage() {
  return (
    <div className="container mx-auto p-6">
      <ShopOrdersList />
    </div>
  )
}
