import { ProductForm } from '@/features/marketplace/products/components/product-form'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/(marketplace)/products/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter()

  return <ProductForm onSuccess={() => router.navigate({ to: '/' })} />
}
