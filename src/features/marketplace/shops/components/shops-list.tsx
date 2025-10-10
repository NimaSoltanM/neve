import { useState } from 'react'
import { useI18n } from '@/features/shared/i18n'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ShopCard } from './shop-card'
import { Link, useNavigate } from '@tanstack/react-router'
import { Search, Store, Plus } from 'lucide-react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

type ShopsListProps = {
  shops: {
    shops: any[]
    total: number
    totalPages: number
    currentPage: number
  } | null
}

export function ShopsList({ shops }: ShopsListProps) {
  const { t, dir } = useI18n()
  const navigate = useNavigate() as any
  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      to: '/shops',
      search: { search: searchInput || undefined, page: 1 },
    })
  }

  const handlePageChange = (page: number) => {
    navigate({
      to: '/shops',
      search: { page },
    })
  }

  if (!shops) {
    return (
      <div className="container mx-auto p-6" dir={dir}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t('common.error')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8" dir={dir}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Store className="h-10 w-10 text-primary" />
            {t('shops.allShops')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('shops.discoverGreatShops')}
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/shop-setup">
            <Plus className="me-2 h-4 w-4" />
            {t('shops.createShop')}
          </Link>
        </Button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('shops.searchShops')}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="ps-10"
          />
        </div>
        <Button type="submit">{t('common.search')}</Button>
      </form>

      {/* Results count */}
      {shops.total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('shops.showingResults', {
            count: shops.shops.length,
            total: shops.total,
          })}
        </p>
      )}

      {/* Empty state */}
      {shops.shops.length === 0 ? (
        <div className="text-center py-16">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <Store className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            {t('shops.noShopsFound')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {searchInput
              ? t('shops.tryDifferentSearch')
              : t('shops.noShopsYet')}
          </p>
          {!searchInput && (
            <Button asChild>
              <Link to="/dashboard/shop-setup">
                <Plus className="me-2 h-4 w-4" />
                {t('shops.createFirstShop')}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Shops Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shops.shops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>

          {/* Pagination */}
          {shops.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      shops.currentPage > 1 &&
                      handlePageChange(shops.currentPage - 1)
                    }
                    className={
                      shops.currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {Array.from({ length: shops.totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={page === shops.currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      shops.currentPage < shops.totalPages &&
                      handlePageChange(shops.currentPage + 1)
                    }
                    className={
                      shops.currentPage === shops.totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  )
}
