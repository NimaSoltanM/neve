import { createFileRoute, Await } from '@tanstack/react-router'
import {
  getShopBySlug,
  getShopProducts,
} from '@/features/marketplace/shops/actions'
import { ProductGrid } from '@/features/marketplace/products/components/product-grid'
import { ProductGridSkeleton } from '@/features/marketplace/products/components/product-grid-skeleton'
import { useI18n } from '@/features/shared/i18n'
import { notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { ShopHeader } from '@/features/marketplace/shops/components/shop-header'

const searchSchema = z.object({
  page: z.number().default(1),
})

export const Route = createFileRoute('/(root)/(marketplace)/shops/$slug')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps: { search } }) => {
    const shopResult = await getShopBySlug({ data: params.slug })

    if (!shopResult.success || !shopResult.data) {
      throw notFound()
    }

    // Get shop products (deferred)
    const productsPromise = getShopProducts({
      data: {
        shopId: shopResult.data.id,
        page: search.page,
        limit: 20,
      },
    })

    return {
      shop: shopResult.data,
      productsPromise,
    }
  },
  component: ShopPage,
})

function ShopPage() {
  const { shop, productsPromise } = Route.useLoaderData()
  const { t, dir } = useI18n()
  const navigate = Route.useNavigate()

  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    })
  }

  return (
    <div dir={dir} className="container mx-auto p-6">
      <ShopHeader shop={shop} />

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-6">
          {t('marketplace.products')}
        </h2>

        <Await promise={productsPromise} fallback={<ProductGridSkeleton />}>
          {(result) => {
            if (!result?.success || !result.data || result.data.length === 0) {
              return (
                <div className="text-center py-12 text-muted-foreground">
                  {t('marketplace.shopNoProducts')}
                </div>
              )
            }

            const products = result.data.map((p) => ({
              ...p,
              shop: {
                id: shop.id,
                name: shop.name,
                slug: shop.slug,
              },
            }))

            return (
              <ProductGrid
                products={products}
                onPageChange={handlePageChange}
              />
            )
          }}
        </Await>
      </div>
    </div>
  )
}
