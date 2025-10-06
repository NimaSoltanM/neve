import { ShopSettings } from '@/features/marketplace/shops/components/shop-settings'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/shop/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <ShopSettings />
    </div>
  )
}
