import { ProductCard } from './product-card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '@/features/shared/i18n'

interface ProductGridProps {
  products: Array<{
    id: number
    name: string
    slug: string
    description?: string | null
    type: 'regular' | 'auction'
    price?: string | null
    stock?: number | null
    currentBid?: string | null
    startingPrice?: string | null
    buyNowPrice?: string | null
    auctionEndsAt?: Date | null
    images: string[]
    shop: {
      id: number
      name: string
      slug: string
    }
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
  onPageChange?: (page: number) => void
  onAddToCart?: (productId: number) => void
  onPlaceBid?: (productId: number) => void
}

export function ProductGrid({
  products,
  pagination,
  onPageChange,
  onAddToCart,
  onPlaceBid,
}: ProductGridProps) {
  const { t } = useI18n()

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          {t('marketplace.noProductsFound')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={() => onAddToCart?.(product.id)}
            onPlaceBid={() => onPlaceBid?.(product.id)}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={!pagination.hasPrev}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNumber: number

                if (pagination.totalPages <= 5) {
                  pageNumber = i + 1
                } else if (pagination.page <= 3) {
                  pageNumber = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNumber = pagination.totalPages - 4 + i
                } else {
                  pageNumber = pagination.page - 2 + i
                }

                return (
                  <Button
                    key={pageNumber}
                    variant={
                      pageNumber === pagination.page ? 'default' : 'outline'
                    }
                    size="icon"
                    onClick={() => onPageChange?.(pageNumber)}
                    className="w-10"
                  >
                    {pageNumber}
                  </Button>
                )
              },
            )}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={!pagination.hasNext}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </div>
      )}
    </div>
  )
}
