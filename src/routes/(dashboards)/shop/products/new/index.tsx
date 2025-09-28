import { createFileRoute } from '@tanstack/react-router'
import { ProductForm } from '@/features/marketplace/products/components/product-form'

export const Route = createFileRoute('/(dashboards)/shop/products/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProductForm />
}
