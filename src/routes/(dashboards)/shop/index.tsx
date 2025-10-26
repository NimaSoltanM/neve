import { ShopOverview } from '@/features/marketplace/shops/components/shop-overview'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/shop/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto p-6">
      <ShopOverview />
    </div>
  )
}
