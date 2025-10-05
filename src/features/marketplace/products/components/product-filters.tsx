import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer'
import { useI18n } from '@/features/shared/i18n'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMediaQuery } from '@/hooks/use-media-query'

interface ProductFiltersProps {
  minPrice?: string
  maxPrice?: string
  type?: 'all' | 'regular' | 'auction'
  sortBy?: string
  inStock?: boolean
  endingSoon?: boolean
}

export function ProductFilters(props: ProductFiltersProps) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isRTL = locale === 'fa'
  const [open, setOpen] = useState(false)

  const [minPrice, setMinPrice] = useState(props.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(props.maxPrice || '')
  const [productType, setProductType] = useState(props.type || 'all')
  const [sortBy, setSortBy] = useState(props.sortBy || 'newest')
  const [inStock, setInStock] = useState(props.inStock || false)
  const [endingSoon, setEndingSoon] = useState(props.endingSoon || false)

  const applyFilters = () => {
    // Validate price range
    const min = minPrice ? parseInt(minPrice) : 0
    const max = maxPrice ? parseInt(maxPrice) : undefined

    if (max && min > max) {
      // Swap if min is greater than max
      setMinPrice(maxPrice)
      setMaxPrice(minPrice)
      return
    }

    navigate({
      search: (prev) => ({
        ...prev,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        type: productType !== 'all' ? productType : undefined,
        sort: sortBy !== 'newest' ? sortBy : undefined,
        inStock: inStock || undefined,
        endingSoon: endingSoon || undefined,
        page: 1,
      }),
    })
    setOpen(false)
  }

  const clearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setProductType('all')
    setSortBy('newest')
    setInStock(false)
    setEndingSoon(false)

    navigate({
      search: (prev) => ({
        page: prev.page,
        search: prev.search,
      }),
    })
  }

  const FilterContent = () => (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Product Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t('marketplace.productType')}
        </Label>
        <RadioGroup
          value={productType}
          onValueChange={setProductType}
          dir={isRTL ? 'rtl' : 'ltr'}
          className="space-y-2"
        >
          <div className="flex items-center">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer ms-2">
              {t('marketplace.allProducts')}
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="regular" id="regular" />
            <Label htmlFor="regular" className="cursor-pointer ms-2">
              {t('marketplace.buyNow')}
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="auction" id="auction" />
            <Label htmlFor="auction" className="cursor-pointer ms-2">
              {t('marketplace.auctions')}
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Price Range */}
      <div className="space-y-3 border-t pt-4">
        <Label className="text-sm font-medium">
          {t('marketplace.priceRange')}
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
              {t('marketplace.min')}
            </Label>
            <Input
              id="minPrice"
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="h-9"
              dir="ltr"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
              {t('marketplace.max')}
            </Label>
            <Input
              id="maxPrice"
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="5000"
              min="0"
              className="h-9"
              dir="ltr"
            />
          </div>
        </div>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinPrice('')
              setMaxPrice('100')
            }}
            className="h-7 text-xs"
          >
            {t('marketplace.under')} 100
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinPrice('100')
              setMaxPrice('500')
            }}
            className="h-7 text-xs"
          >
            100-500
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinPrice('500')
              setMaxPrice('1000')
            }}
            className="h-7 text-xs"
          >
            500-1000
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMinPrice('1000')
              setMaxPrice('')
            }}
            className="h-7 text-xs"
          >
            {t('marketplace.above')} 1000
          </Button>
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-3 border-t pt-4">
        <Label className="text-sm font-medium">{t('marketplace.sortBy')}</Label>
        <RadioGroup
          value={sortBy}
          onValueChange={setSortBy}
          dir={isRTL ? 'rtl' : 'ltr'}
          className="space-y-2"
        >
          <div className="flex items-center">
            <RadioGroupItem value="newest" id="newest" />
            <Label htmlFor="newest" className="cursor-pointer ms-2">
              {t('marketplace.newest')}
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="price_asc" id="price_asc" />
            <Label htmlFor="price_asc" className="cursor-pointer ms-2">
              {t('marketplace.priceLowToHigh')}
            </Label>
          </div>
          <div className="flex items-center">
            <RadioGroupItem value="price_desc" id="price_desc" />
            <Label htmlFor="price_desc" className="cursor-pointer ms-2">
              {t('marketplace.priceHighToLow')}
            </Label>
          </div>
          {productType === 'auction' && (
            <div className="flex items-center">
              <RadioGroupItem value="ending_soon" id="ending_soon" />
              <Label htmlFor="ending_soon" className="cursor-pointer ms-2">
                {t('marketplace.endingSoon')}
              </Label>
            </div>
          )}
        </RadioGroup>
      </div>

      {/* Additional Filters */}
      <div className="space-y-3 border-t pt-4">
        <Label className="text-sm font-medium">
          {t('marketplace.additionalFilters')}
        </Label>
        {productType !== 'auction' && (
          <div className="flex items-center">
            <Checkbox
              id="inStock"
              checked={inStock}
              onCheckedChange={setInStock as any}
            />
            <Label htmlFor="inStock" className="cursor-pointer ms-2">
              {t('marketplace.inStockOnly')}
            </Label>
          </div>
        )}
        {productType === 'auction' && (
          <div className="flex items-center">
            <Checkbox
              id="endingSoon"
              checked={endingSoon}
              onCheckedChange={setEndingSoon as any}
            />
            <Label htmlFor="endingSoon" className="cursor-pointer ms-2">
              {t('marketplace.endingIn24h')}
            </Label>
          </div>
        )}
      </div>
    </div>
  )

  // Desktop view
  if (isDesktop) {
    return (
      <Card className="sticky top-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {t('marketplace.filters')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2"
            >
              <X className="h-3 w-3 me-1" />
              {t('common.clear')}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <FilterContent />
          <Button onClick={applyFilters} className="w-full mt-6">
            {t('marketplace.applyFilters')}
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Mobile view
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full lg:hidden gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {t('marketplace.filters')}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <div className="flex items-center justify-between">
            <DrawerTitle>{t('marketplace.filters')}</DrawerTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2"
            >
              <X className="h-3 w-3 me-1" />
              {t('common.clear')}
            </Button>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 py-2">
          <FilterContent />
        </div>

        <DrawerFooter>
          <Button onClick={applyFilters}>
            {t('marketplace.applyFilters')}
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
