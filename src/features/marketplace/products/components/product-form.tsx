import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileUpload } from '@/features/shared/upload/components/file-upload'
import { LanguageSwitcher, useI18n } from '@/features/shared/i18n'
import { generateSlug } from '@/lib/utils'
import {
  createProduct,
  updateProduct,
  getUserShops,
} from '../actions/product-management.actions'
import { getCategories } from '@/features/marketplace/categories/actions'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CalendarIcon,
  Package,
  DollarSign,
  Gavel,
  Image as ImageIcon,
  Info,
  Store,
  Tag,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { UploadedFile } from '@/features/shared/upload/types/upload.types'

// Define form type explicitly
type ProductFormValues = {
  name: string
  slug: string
  description?: string
  categoryId: string
  shopId: string
  type: 'regular' | 'auction'
  images: any[]
  price?: string
  stock?: string
  startingPrice?: string
  bidIncrement: string
  buyNowPrice?: string
  auctionEndsAt?: Date
}

const formSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Product name must be at least 3 characters')
      .max(200),
    slug: z
      .string()
      .min(3, 'Slug must be at least 3 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers and hyphens',
      ),
    description: z.string().max(2000).optional(),
    categoryId: z.string().min(1, 'Please select a category'),
    shopId: z.string().min(1, 'Please select a shop'),
    type: z.enum(['regular', 'auction']),
    images: z
      .array(z.any())
      .min(1, 'At least one image is required')
      .max(10, 'Maximum 10 images allowed'),
    price: z.string().optional(),
    stock: z.string().optional(),
    startingPrice: z.string().optional(),
    bidIncrement: z.string().default('1.00'),
    buyNowPrice: z.string().optional(),
    auctionEndsAt: z.date().optional(),
  })
  .refine(
    (data) => {
      if (data.type === 'regular') {
        return (
          data.price &&
          parseFloat(data.price) > 0 &&
          data.stock &&
          parseInt(data.stock) >= 0
        )
      }
      if (data.type === 'auction') {
        return (
          data.startingPrice &&
          parseFloat(data.startingPrice) > 0 &&
          data.auctionEndsAt &&
          data.auctionEndsAt > new Date()
        )
      }
      return true
    },
    {
      message:
        'Please fill in all required fields for the selected product type',
    },
  )

interface ProductFormProps {
  product?: any
  onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { t, locale, dir } = useI18n()
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [productType, setProductType] = useState<'regular' | 'auction'>(
    product?.type || 'regular',
  )

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      categoryId: product?.categoryId?.toString() || '',
      shopId: product?.shopId?.toString() || '',
      type: product?.type || 'regular',
      images: product?.images || [],
      price: product?.price || '',
      stock: product?.stock?.toString() || '0',
      startingPrice: product?.startingPrice || '',
      bidIncrement: product?.bidIncrement || '1.00',
      buyNowPrice: product?.buyNowPrice || '',
      auctionEndsAt: product?.auctionEndsAt
        ? new Date(product.auctionEndsAt)
        : undefined,
    },
  })

  // Fetch user shops
  const { data: shopsData, isLoading: shopsLoading } = useQuery({
    queryKey: ['userShops'],
    queryFn: async () => getUserShops(),
  })

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => getCategories(),
  })

  // Auto-generate slug from name
  const nameValue = form.watch('name')
  useEffect(() => {
    if (!isSlugManual && nameValue && !product) {
      const hasPersian =
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
          nameValue,
        )

      if (!hasPersian) {
        const generatedSlug = generateSlug(nameValue)
        form.setValue('slug', generatedSlug)
      }
    }
  }, [nameValue, isSlugManual, product, form])

  // Watch product type
  const watchType = form.watch('type')
  useEffect(() => {
    setProductType(watchType)
  }, [watchType])

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const imageUrls = (values.images as UploadedFile[]).map((img) => img.url)

      const data = {
        ...values,
        categoryId: parseInt(values.categoryId),
        shopId: parseInt(values.shopId),
        images: imageUrls,
        stock: values.stock ? parseInt(values.stock) : undefined,
        auctionEndsAt: values.auctionEndsAt?.toISOString(),
      }

      if (product) {
        return updateProduct({ data: { ...data, id: product.id } })
      }
      return createProduct({ data })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          product ? t('products.productUpdated') : t('products.productAdded'),
        )
        onSuccess?.()
        if (!product) {
          form.reset()
        }
      } else {
        toast.error(result.error || t('common.error'))
      }
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const onSubmit = (values: ProductFormValues) => {
    // Additional validation for auction buy now price
    if (values.type === 'auction' && values.buyNowPrice) {
      const buyNow = parseFloat(values.buyNowPrice)
      const starting = parseFloat(values.startingPrice || '0')
      if (buyNow <= starting) {
        toast.error('Buy now price must be higher than starting price')
        return
      }
    }
    mutation.mutate(values)
  }

  const hasPersianInName =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      nameValue || '',
    )
  const isLoading = shopsLoading || categoriesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  // Check if user has shops
  if (!shopsData?.data || shopsData.data.length === 0) {
    return (
      <Alert>
        <Store className="h-4 w-4" />
        <AlertTitle>{t('shops.noShopsFound')}</AlertTitle>
        <AlertDescription>{t('shops.createShopToday')}</AlertDescription>
      </Alert>
    )
  }

  console.log('shops are', shopsData.data)

  return (
    <Form {...form}>
      <LanguageSwitcher />
      <form
        onSubmit={form.handleSubmit(onSubmit) as any}
        className="space-y-8"
        dir={dir}
      >
        {/* Product Type Selection - More prominent for new products */}
        {!product && (
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <CardTitle>{t('marketplace.productType')}</CardTitle>
              </div>
              <CardDescription>
                Choose how you want to sell this product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                      >
                        <label
                          htmlFor="regular"
                          className={cn(
                            'flex flex-col items-center justify-center rounded-lg border-2 p-6 cursor-pointer hover:bg-accent transition-colors',
                            field.value === 'regular' &&
                              'border-primary bg-primary/5',
                          )}
                        >
                          <RadioGroupItem
                            value="regular"
                            id="regular"
                            className="sr-only"
                          />
                          <DollarSign className="h-8 w-8 mb-3" />
                          <span className="font-semibold">
                            {t('products.regularProduct')}
                          </span>
                          <span className="text-sm text-muted-foreground text-center mt-1">
                            Fixed price, immediate purchase
                          </span>
                        </label>

                        <label
                          htmlFor="auction"
                          className={cn(
                            'flex flex-col items-center justify-center rounded-lg border-2 p-6 cursor-pointer hover:bg-accent transition-colors',
                            field.value === 'auction' &&
                              'border-primary bg-primary/5',
                          )}
                        >
                          <RadioGroupItem
                            value="auction"
                            id="auction"
                            className="sr-only"
                          />
                          <Gavel className="h-8 w-8 mb-3" />
                          <span className="font-semibold">
                            {t('products.auctionProduct')}
                          </span>
                          <span className="text-sm text-muted-foreground text-center mt-1">
                            Bidding system with time limit
                          </span>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              <CardTitle>{t('products.productInformation')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Product Name */}
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      {t('products.productName')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('products.productNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control as any}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      URL Slug
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="product-name"
                          {...field}
                          dir="ltr"
                          className="font-mono text-sm"
                          onChange={(e) => {
                            field.onChange(e)
                            setIsSlugManual(true)
                          }}
                        />
                        {hasPersianInName && (
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 end-0"
                          >
                            Manual entry required
                          </Badge>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      {hasPersianInName
                        ? 'Persian text detected. Please enter an English URL.'
                        : 'Auto-generated from product name'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              {/* Shop Selection */}
              <FormField
                control={form.control as any}
                name="shopId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Store className="h-4 w-4" />
                      {t('products.selectShop')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('products.selectShop')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shopsData?.data?.map((shop: any) => (
                          <SelectItem key={shop.id} value={shop.id.toString()}>
                            {shop.name}
                            {!shop.isActive && (
                              <Badge variant="secondary" className="ms-2">
                                Inactive
                              </Badge>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Selection */}
              <FormField
                control={form.control as any}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      {t('products.selectCategory')}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('products.selectCategory')}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoriesData?.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name[locale as 'en' | 'fa'] || cat.name.en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Description */}
            <FormField
              control={form.control as any}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.productDescription')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('products.productDescriptionPlaceholder')}
                      {...field}
                      rows={5}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/2000 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <CardTitle>{t('common.images')}</CardTitle>
            </div>
            <CardDescription>
              Add up to 10 product images. First image will be the main display
              image.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control as any}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FileUpload
                      multiple
                      accept="image/*"
                      maxSize={5}
                      value={field.value as UploadedFile[]}
                      onChange={(files) => field.onChange(files || [])}
                      category="products"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing & Inventory */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>{t('products.pricingAndInventory')}</CardTitle>
            </div>
            <CardDescription>
              {productType === 'auction'
                ? 'Set up auction parameters and pricing'
                : 'Set your product price and inventory'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {productType === 'regular' ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Regular Price */}
                <FormField
                  control={form.control as any}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        {t('products.regularPrice')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            className="ps-8"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stock */}
                <FormField
                  control={form.control as any}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        {t('common.stock')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Available quantity for sale
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Starting Price */}
                  <FormField
                    control={form.control as any}
                    name="startingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          {t('products.startingBid')}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="ps-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bid Increment */}
                  <FormField
                    control={form.control as any}
                    name="bidIncrement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          {t('products.bidIncrement')}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="1.00"
                              className="ps-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Minimum amount bids must increase
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Buy Now Price */}
                  <FormField
                    control={form.control as any}
                    name="buyNowPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('products.buyNowPrice')}
                          <Badge variant="secondary" className="ms-2">
                            Optional
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="Leave empty to disable"
                              className="ps-8"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Allow immediate purchase at this price
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Auction End Date */}
                  <FormField
                    control={form.control as any}
                    name="auctionEndsAt"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center gap-1">
                          {t('products.auctionEndDate')}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full ps-3 text-start font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ms-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < addDays(new Date(), 1)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Auction must run for at least 24 hours
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Auction Info Alert */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Once the auction starts with bids, you cannot edit the
                    auction parameters. The auction will automatically extend by
                    2 minutes if a bid is placed in the last 2 minutes.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 -mx-4 border-t">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="flex-1 h-12"
            size="lg"
          >
            {mutation.isPending ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full me-2" />
                {t('common.loading')}
              </>
            ) : product ? (
              t('common.save')
            ) : (
              t('products.publish')
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-12"
            // onClick={() => navigate({ to: '/dashboard/products' })}
          >
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
