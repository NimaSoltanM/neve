import { createFileRoute, Await, useRouter } from '@tanstack/react-router'
import { getCategoryBySlug } from '@/features/marketplace/categories/actions'
import { getProducts } from '@/features/marketplace/products/actions'
import { ProductGrid } from '@/features/marketplace/products/components/product-grid'
import { ProductGridSkeleton } from '@/features/marketplace/products/components/product-grid-skeleton'
import { CategoryHeader } from '@/features/marketplace/categories/components/category-header'
import { ProductFilters } from '@/features/marketplace/products/components/product-filters'
import { PlaceBidModal } from '@/features/marketplace/bids/components/place-bid-modal'
import { useI18n } from '@/features/shared/i18n'
import { z } from 'zod'
import { notFound } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

const searchSchema = z.object({
  page: z.number().default(1),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'ending_soon']).optional(),
  type: z.enum(['all', 'regular', 'auction']).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  search: z.string().optional(),
  inStock: z.boolean().optional(),
  endingSoon: z.boolean().optional(),
})

export const Route = createFileRoute('/categories/$slug')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ params, deps: { search } }) => {
    // Call server function with proper format
    const categoryResult = await getCategoryBySlug({ data: params.slug })

    if (!categoryResult.success || !categoryResult.data) {
      throw notFound()
    }

    // Call getProducts with proper format
    const productsPromise = getProducts({
      data: {
        categoryId: categoryResult.data.id,
        ...search,
        sortBy: search.sort || 'newest',
        type: search.type || 'all',
        limit: 20,
      },
    })

    return {
      category: categoryResult.data,
      productsPromise,
    }
  },
  component: CategoryPage,
})

function CategoryPage() {
  const router = useRouter()
  const { category, productsPromise } = Route.useLoaderData()
  const { t, dir } = useI18n()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  // Modal and product state
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const handlePageChange = (page: number) => {
    navigate({
      search: (prev) => ({ ...prev, page }),
    })
  }

  const handlePlaceBid = (product: any) => {
    setSelectedProduct(product)
    setBidModalOpen(true)
  }

  const handleAddToCart = (product: any) => {
    // TODO: Implement cart functionality
    toast.success(`${product.name} added to cart`)
  }

  const handleBuyNow = (product: any) => {
    // TODO: Implement buy now for auctions
    toast.success(`Buying ${product.name} for ${product.buyNowPrice}`)
  }

  return (
    <div dir={dir} className="container mx-auto p-6">
      <CategoryHeader category={category} />

      <div className="mt-8 space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
        {/* Filters */}
        <aside className="lg:col-span-1">
          <ProductFilters {...search} />
        </aside>

        {/* Products */}
        <main className="lg:col-span-3">
          <Await promise={productsPromise} fallback={<ProductGridSkeleton />}>
            {(result) => {
              if (
                !result ||
                !result.success ||
                !result.data ||
                result.data.items.length === 0
              ) {
                return (
                  <div className="text-center py-12 text-muted-foreground">
                    {t('marketplace.noProductsInCategory')}
                  </div>
                )
              }

              const { items, pagination } = result.data

              return (
                <>
                  <ProductGrid
                    products={items}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onAddToCart={(productId) => {
                      const product = items.find((p) => p.id === productId)
                      if (product) {
                        if (product.type === 'auction' && product.buyNowPrice) {
                          handleBuyNow(product)
                        } else {
                          handleAddToCart(product)
                        }
                      }
                    }}
                    onPlaceBid={(productId) => {
                      const product = items.find((p) => p.id === productId)
                      if (product) handlePlaceBid(product)
                    }}
                  />

                  {/* Bid Modal */}
                  {selectedProduct && (
                    <PlaceBidModal
                      open={bidModalOpen}
                      onOpenChange={setBidModalOpen}
                      product={selectedProduct}
                      onSuccess={() => {
                        setBidModalOpen(false)
                        router.invalidate()
                      }}
                    />
                  )}
                </>
              )
            }}
          </Await>
        </main>
      </div>
    </div>
  )
}
