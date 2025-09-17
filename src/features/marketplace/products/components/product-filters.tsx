import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
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
  const { t } = useI18n()
  const navigate = useNavigate()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [open, setOpen] = useState(false)

  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(props.minPrice || '0'),
    parseInt(props.maxPrice || '5000'),
  ])
  const [productType, setProductType] = useState(props.type || 'all')
  const [sortBy, setSortBy] = useState(props.sortBy || 'newest')
  const [inStock, setInStock] = useState(props.inStock || false)
  const [endingSoon, setEndingSoon] = useState(props.endingSoon || false)

  const applyFilters = () => {
    navigate({
      search: (prev) => ({
        ...prev,
        minPrice: priceRange[0] > 0 ? priceRange[0].toString() : undefined,
        maxPrice: priceRange[1] < 5000 ? priceRange[1].toString() : undefined,
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
    setPriceRange([0, 5000])
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
    <div className="space-y-6">
      {/* Product Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          {t('marketplace.productType')}
        </Label>
        <RadioGroup
          value={productType}
          onValueChange={setProductType}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer">
              {t('marketplace.allProducts')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="regular" id="regular" />
            <Label htmlFor="regular" className="cursor-pointer">
              {t('marketplace.buyNow')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="auction" id="auction" />
            <Label htmlFor="auction" className="cursor-pointer">
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
        <Slider
          value={priceRange}
          onValueChange={setPriceRange as any}
          min={0}
          max={5000}
          step={50}
          className="w-full"
        />
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
            }
            className="h-8 w-full"
            placeholder={t('marketplace.min')}
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])
            }
            className="h-8 w-full"
            placeholder={t('marketplace.max')}
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-3 border-t pt-4">
        <Label className="text-sm font-medium">{t('marketplace.sortBy')}</Label>
        <RadioGroup
          value={sortBy}
          onValueChange={setSortBy}
          className="space-y-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="newest" id="newest" />
            <Label htmlFor="newest" className="cursor-pointer">
              {t('marketplace.newest')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="price_asc" id="price_asc" />
            <Label htmlFor="price_asc" className="cursor-pointer">
              {t('marketplace.priceLowToHigh')}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="price_desc" id="price_desc" />
            <Label htmlFor="price_desc" className="cursor-pointer">
              {t('marketplace.priceHighToLow')}
            </Label>
          </div>
          {productType === 'auction' && (
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ending_soon" id="ending_soon" />
              <Label htmlFor="ending_soon" className="cursor-pointer">
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
          <div className="flex items-center gap-2">
            <Checkbox
              id="inStock"
              checked={inStock}
              onCheckedChange={setInStock as any}
            />
            <Label htmlFor="inStock" className="cursor-pointer">
              {t('marketplace.inStockOnly')}
            </Label>
          </div>
        )}
        {productType === 'auction' && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="endingSoon"
              checked={endingSoon}
              onCheckedChange={setEndingSoon as any}
            />
            <Label htmlFor="endingSoon" className="cursor-pointer">
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
