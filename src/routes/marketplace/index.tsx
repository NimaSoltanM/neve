import { createFileRoute, Await, useRouter } from '@tanstack/react-router'
import { getCategories } from '@/features/marketplace/categories/actions'
import { getProducts } from '@/features/marketplace/products/actions'
import { CategoryGrid } from '@/features/marketplace/categories/components/category-grid'
import { CategoryGridSkeleton } from '@/features/marketplace/categories/components/category-grid-skeleton'
import { ProductGrid } from '@/features/marketplace/products/components/product-grid'
import { ProductGridSkeleton } from '@/features/marketplace/products/components/product-grid-skeleton'
import { ProductFilters } from '@/features/marketplace/products/components/product-filters'
import { PlaceBidModal } from '@/features/marketplace/bids/components/place-bid-modal'
import { LanguageSwitcher, useI18n } from '@/features/shared/i18n'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { z } from 'zod'
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

export const Route = createFileRoute('/marketplace/')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    // Don't await - for deferred loading
    const categoriesPromise = getCategories()
    const productsPromise = getProducts({
      data: {
        ...search,
        sortBy: search.sort || 'newest',
        type: search.type || 'all',
        limit: 20,
      },
    })

    return {
      categoriesPromise,
      productsPromise,
    }
  },
  component: MarketplacePage,
})

function MarketplacePage() {
  const router = useRouter()
  const { categoriesPromise, productsPromise } = Route.useLoaderData()
  const { t, dir } = useI18n()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  // Modal and product state
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  const handleSearch = (value: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        search: value || undefined,
        page: 1,
      }),
    })
  }

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
      <LanguageSwitcher />
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('marketplace.title')}</h1>
        <p className="text-muted-foreground text-lg mb-6">
          {t('marketplace.subtitle')}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder={t('marketplace.searchPlaceholder')}
            className="ps-10"
            defaultValue={search.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Section */}
      {!search.search && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">
            {t('marketplace.browseCategories')}
          </h2>
          <Await
            promise={categoriesPromise}
            fallback={<CategoryGridSkeleton />}
          >
            {(result) => {
              if (!result || result.length === 0) {
                return null
              }
              return <CategoryGrid categories={result} />
            }}
          </Await>
        </section>
      )}

      {/* Products Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">
          {search.search
            ? t('marketplace.searchResults')
            : t('marketplace.featuredProducts')}
        </h2>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
          {/* Filters - Desktop sidebar, Mobile drawer */}
          <aside className="lg:col-span-1">
            <ProductFilters {...search} />
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            <Await promise={productsPromise} fallback={<ProductGridSkeleton />}>
              {(result) => {
                // Check for success and data existence first
                if (!result?.success || !result.data) {
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      {t('marketplace.noProductsFound')}
                    </div>
                  )
                }

                // Now we know data exists
                const { items, pagination } = result.data

                if (items.length === 0) {
                  return (
                    <div className="text-center py-12 text-muted-foreground">
                      {t('marketplace.noProductsFound')}
                    </div>
                  )
                }

                return (
                  <>
                    <ProductGrid
                      products={items}
                      pagination={pagination}
                      onPageChange={handlePageChange}
                      onAddToCart={(productId) => {
                        const product = items.find((p) => p.id === productId)
                        if (product) {
                          if (
                            product.type === 'auction' &&
                            product.buyNowPrice
                          ) {
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
      </section>
    </div>
  )
}
