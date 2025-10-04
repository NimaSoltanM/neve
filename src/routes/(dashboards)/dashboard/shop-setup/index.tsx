import { ShopForm } from '@/features/marketplace/shops/components/shop-form'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/dashboard/shop-setup/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ShopForm mode="create" />
}
