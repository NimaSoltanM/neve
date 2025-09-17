import { getProductBySlug } from '@/features/marketplace/products/actions'
import { createFileRoute, notFound } from '@tanstack/react-router'

export const Route = createFileRoute('/products/$productSlug/')({
  loader: async ({ params }) => {
    const product = await getProductBySlug({ data: params.productSlug })

    if (!product.success || !product.data) {
      throw notFound()
    }

    console.log('product is', product)
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/$product-slug/"!</div>
}
