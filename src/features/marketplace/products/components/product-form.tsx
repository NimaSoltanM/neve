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
import { getCategories } from '@/features/marketplace/categories/actions'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  CalendarIcon,
  Package,
  DollarSign,
  Gavel,
  Image as ImageIcon,
  Info,
  Store,
  Tag,
  Coins,
} from 'lucide-react'
import { format, addDays } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { UploadedFile } from '@/features/shared/upload/types/upload.types'
import {
  createProduct,
  updateProduct as updateProductManagement,
  getUserShops,
} from '../actions/product-management.actions'

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

const formSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  shopId: z.string().min(1, 'Shop is required'),
  type: z.enum(['regular', 'auction']),
  images: z.array(z.any()).min(1, 'At least one image is required'),
  price: z.string().optional(),
  stock: z.string().optional(),
  startingPrice: z.string().optional(),
  bidIncrement: z.string().default('1.00'),
  buyNowPrice: z.string().optional(),
  auctionEndsAt: z.date().optional(),
})

type ProductFormProps = {
  product?: any
  onSuccess?: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { t, locale, dir } = useI18n()
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [productType, setProductType] = useState<'regular' | 'auction'>(
    product?.type || 'regular',
  )

  // Display states for price fields
  const [priceDisplay, setPriceDisplay] = useState('')
  const [startingPriceDisplay, setStartingPriceDisplay] = useState('')
  const [bidIncrementDisplay, setBidIncrementDisplay] = useState('')
  const [buyNowPriceDisplay, setBuyNowPriceDisplay] = useState('')

  const isPersian = locale === 'fa'

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: product?.name || '',
      slug: product?.slug || '',
      description: product?.description || '',
      categoryId: product?.categoryId?.toString() || '',
      shopId: product?.shopId?.toString() || '',
      type: product?.type || 'regular',
      images: product?.images
        ? product.images.map((url: string) => {
            const fileName = url.split('/').pop() || ''
            const extension = fileName.split('.').pop()?.toLowerCase() || ''

            let mimeType = 'image/jpeg'
            if (extension === 'png') mimeType = 'image/png'
            if (extension === 'gif') mimeType = 'image/gif'
            if (extension === 'webp') mimeType = 'image/webp'

            return {
              id: fileName,
              url,
              name: fileName,
              size: 0,
              type: mimeType,
            }
          })
        : [],
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

  // Initialize display values when product or locale changes
  useEffect(() => {
    if (product?.price) {
      const dollarValue = parseFloat(product.price)
      setPriceDisplay(
        isPersian
          ? Math.round(dollarValue * 100000).toString()
          : dollarValue.toFixed(2),
      )
    }
    if (product?.startingPrice) {
      const dollarValue = parseFloat(product.startingPrice)
      setStartingPriceDisplay(
        isPersian
          ? Math.round(dollarValue * 100000).toString()
          : dollarValue.toFixed(2),
      )
    }
    if (product?.bidIncrement) {
      const dollarValue = parseFloat(product.bidIncrement)
      setBidIncrementDisplay(
        isPersian
          ? Math.round(dollarValue * 100000).toString()
          : dollarValue.toFixed(2),
      )
    }
    if (product?.buyNowPrice) {
      const dollarValue = parseFloat(product.buyNowPrice)
      setBuyNowPriceDisplay(
        isPersian
          ? Math.round(dollarValue * 100000).toString()
          : dollarValue.toFixed(2),
      )
    }
  }, [product, isPersian])

  const nameValue = form.watch('name')

  useEffect(() => {
    if (!isSlugManual && nameValue) {
      form.setValue('slug', generateSlug(nameValue))
    }
  }, [nameValue, isSlugManual, form])

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: shopsResponse, isLoading: shopsLoading } = useQuery({
    queryKey: ['user-shops'],
    queryFn: getUserShops,
  })

  const shops = shopsResponse?.data || []

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const data = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        categoryId: parseInt(values.categoryId),
        shopId: parseInt(values.shopId),
        type: values.type,
        images: values.images.map((img: UploadedFile) => img.url),
        price:
          values.type === 'regular' && values.price
            ? values.price // <-- Remove parseFloat(), keep as string
            : undefined,
        stock:
          values.type === 'regular' && values.stock
            ? parseInt(values.stock)
            : undefined,
        startingPrice:
          values.type === 'auction' && values.startingPrice
            ? values.startingPrice // <-- Remove parseFloat(), keep as string
            : undefined,
        bidIncrement:
          values.type === 'auction'
            ? values.bidIncrement || '1.00' // <-- Remove parseFloat(), keep as string
            : undefined,
        buyNowPrice:
          values.type === 'auction' && values.buyNowPrice
            ? values.buyNowPrice // <-- Remove parseFloat(), keep as string
            : undefined,
        auctionEndsAt:
          values.type === 'auction' && values.auctionEndsAt
            ? values.auctionEndsAt
            : undefined,
      }

      if (product?.id) {
        return await updateProductManagement({
          data: { ...data, id: product.id },
        })
      }
      return await createProduct({ data })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          product ? t('shops.productUpdated') : t('products.productAdded'),
        )
        onSuccess?.()
        if (!product) {
          form.reset()
          setPriceDisplay('')
          setStartingPriceDisplay('')
          setBidIncrementDisplay('')
          setBuyNowPriceDisplay('')
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

  return (
    <div className="space-y-6" dir={dir}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {product ? t('products.editProduct') : t('products.addProduct')}
          </h2>
          <p className="text-muted-foreground">
            {product
              ? t('products.editProductDesc')
              : t('products.addProductDesc')}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Product Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                {t('products.productType')}
              </CardTitle>
              <CardDescription>{t('products.productTypeDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => {
                          field.onChange(value)
                          setProductType(value as 'regular' | 'auction')
                        }}
                        value={field.value}
                        className="grid gap-4 md:grid-cols-2"
                      >
                        <label
                          htmlFor="regular"
                          className={cn(
                            'flex cursor-pointer items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                            field.value === 'regular' &&
                              'border-primary bg-accent',
                          )}
                        >
                          <RadioGroupItem value="regular" id="regular" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Package className="h-5 w-5" />
                              <p className="font-semibold leading-none">
                                {t('products.regularProduct')}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t('products.regularProductDesc')}
                            </p>
                          </div>
                        </label>
                        <label
                          htmlFor="auction"
                          className={cn(
                            'flex cursor-pointer items-start gap-4 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground',
                            field.value === 'auction' &&
                              'border-primary bg-accent',
                          )}
                        >
                          <RadioGroupItem value="auction" id="auction" />
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Gavel className="h-5 w-5" />
                              <p className="font-semibold leading-none">
                                {t('products.auctionProduct')}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {t('products.auctionProductDesc')}
                            </p>
                          </div>
                        </label>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t('products.basicInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
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
                      <FormDescription>
                        {t('products.productNameDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        {t('products.slug')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder={t('products.slugPlaceholder')}
                            {...field}
                            disabled={!isSlugManual && !hasPersianInName}
                            onChange={(e) => {
                              setIsSlugManual(true)
                              field.onChange(e)
                            }}
                            className={cn(
                              !isSlugManual &&
                                !hasPersianInName &&
                                'bg-muted cursor-not-allowed',
                            )}
                          />
                          {hasPersianInName && (
                            <Badge
                              variant="secondary"
                              className="absolute end-2 top-1/2 -translate-y-1/2"
                            >
                              {t('products.manualSlug')}
                            </Badge>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        {hasPersianInName
                          ? t('products.slugDescPersian')
                          : t('products.slugDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control as any}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('products.description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('products.descriptionPlaceholder')}
                        className="min-h-32 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('products.descriptionDesc')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control as any}
                  name="shopId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <Store className="h-4 w-4" />
                        {t('products.shop')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoading
                                  ? t('common.loading')
                                  : t('products.selectShop')
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shops?.map((shop: any) => (
                            <SelectItem
                              key={shop.id}
                              value={shop.id.toString()}
                            >
                              {typeof shop.name === 'object'
                                ? shop.name[locale] || shop.name.en
                                : shop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t('products.shopDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        {t('products.category')}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isLoading
                                  ? t('common.loading')
                                  : t('products.selectCategory')
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category: any) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {typeof category.name === 'object'
                                ? category.name[locale] || category.name.en
                                : category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {t('products.categoryDesc')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                {t('products.images')}
              </CardTitle>
              <CardDescription>{t('products.imagesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control as any}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={field.onChange}
                        accept="image/*"
                        multiple
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
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {productType === 'regular'
                  ? t('products.pricingInventory')
                  : t('products.auctionDetails')}
              </CardTitle>
              <CardDescription>
                {productType === 'regular'
                  ? t('products.pricingInventoryDesc')
                  : t('products.auctionDetailsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {productType === 'regular' ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control as any}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          {t('products.price')}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              {isPersian ? <Coins className="h-4 w-4" /> : '$'}
                            </span>
                            <Input
                              type="text"
                              placeholder={isPersian ? '۱۰۰۰۰۰' : '1.00'}
                              className={cn(
                                'ps-8',
                                isPersian ? 'pe-16' : 'pe-4',
                              )}
                              value={priceDisplay}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(
                                  /[^\d.]/g,
                                  '',
                                )
                                setPriceDisplay(cleaned)

                                if (isPersian) {
                                  const tomanValue = parseFloat(cleaned || '0')
                                  const dollarValue = (
                                    tomanValue / 100000
                                  ).toFixed(2)
                                  field.onChange(dollarValue)
                                } else {
                                  field.onChange(cleaned)
                                }
                              }}
                            />
                            {isPersian && (
                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                تومان
                              </span>
                            )}
                          </div>
                        </FormControl>
                        {isPersian && field.value && (
                          <FormDescription className="text-xs">
                            ≈ ${parseFloat(field.value).toFixed(2)} USD
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as any}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          {t('products.stock')}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t('products.stockDesc')}
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
                                {isPersian ? (
                                  <Coins className="h-4 w-4" />
                                ) : (
                                  '$'
                                )}
                              </span>
                              <Input
                                type="text"
                                placeholder={isPersian ? '۱۰۰۰۰۰' : '0.00'}
                                className={cn(
                                  'ps-8',
                                  isPersian ? 'pe-16' : 'pe-4',
                                )}
                                value={startingPriceDisplay}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(
                                    /[^\d.]/g,
                                    '',
                                  )
                                  setStartingPriceDisplay(cleaned)

                                  if (isPersian) {
                                    const tomanValue = parseFloat(
                                      cleaned || '0',
                                    )
                                    const dollarValue = (
                                      tomanValue / 100000
                                    ).toFixed(2)
                                    field.onChange(dollarValue)
                                  } else {
                                    field.onChange(cleaned)
                                  }
                                }}
                              />
                              {isPersian && (
                                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                  تومان
                                </span>
                              )}
                            </div>
                          </FormControl>
                          {isPersian && field.value && (
                            <FormDescription className="text-xs">
                              ≈ ${parseFloat(field.value).toFixed(2)} USD
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Auction End Date */}
                    <FormField
                      control={form.control as any}
                      name="auctionEndsAt"
                      render={({ field }) => (
                        <FormItem>
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
                                    'w-full justify-start text-start font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                >
                                  <CalendarIcon className="me-2 h-4 w-4" />
                                  {field.value ? (
                                    format(field.value, 'PPP')
                                  ) : (
                                    <span>{t('products.pickDate')}</span>
                                  )}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < addDays(new Date(), 1)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            {t('products.auctionEndDateDesc')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Bid Increment */}
                    <FormField
                      control={form.control as any}
                      name="bidIncrement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('products.bidIncrement')}</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {isPersian ? (
                                  <Coins className="h-4 w-4" />
                                ) : (
                                  '$'
                                )}
                              </span>
                              <Input
                                type="text"
                                placeholder={isPersian ? '۱۰۰۰۰' : '1.00'}
                                className={cn(
                                  'ps-8',
                                  isPersian ? 'pe-16' : 'pe-4',
                                )}
                                value={bidIncrementDisplay}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(
                                    /[^\d.]/g,
                                    '',
                                  )
                                  setBidIncrementDisplay(cleaned)

                                  if (isPersian) {
                                    const tomanValue = parseFloat(
                                      cleaned || '0',
                                    )
                                    const dollarValue = (
                                      tomanValue / 100000
                                    ).toFixed(2)
                                    field.onChange(dollarValue)
                                  } else {
                                    field.onChange(cleaned)
                                  }
                                }}
                              />
                              {isPersian && (
                                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                  تومان
                                </span>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription>
                            {t('products.bidIncrementDesc')}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Buy Now Price (Optional) */}
                    <FormField
                      control={form.control as any}
                      name="buyNowPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t('products.buyNowPrice')}{' '}
                            <span className="text-muted-foreground text-sm">
                              ({t('common.optional')})
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {isPersian ? (
                                  <Coins className="h-4 w-4" />
                                ) : (
                                  '$'
                                )}
                              </span>
                              <Input
                                type="text"
                                placeholder={isPersian ? '۵۰۰۰۰۰' : '0.00'}
                                className={cn(
                                  'ps-8',
                                  isPersian ? 'pe-16' : 'pe-4',
                                )}
                                value={buyNowPriceDisplay}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(
                                    /[^\d.]/g,
                                    '',
                                  )
                                  setBuyNowPriceDisplay(cleaned)

                                  if (isPersian) {
                                    const tomanValue = parseFloat(
                                      cleaned || '0',
                                    )
                                    const dollarValue = (
                                      tomanValue / 100000
                                    ).toFixed(2)
                                    field.onChange(dollarValue)
                                  } else {
                                    field.onChange(cleaned)
                                  }
                                }}
                              />
                              {isPersian && (
                                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                  تومان
                                </span>
                              )}
                            </div>
                          </FormControl>
                          {isPersian && field.value && (
                            <FormDescription className="text-xs">
                              ≈ ${parseFloat(field.value).toFixed(2)} USD
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>{t('products.auctionNotice')}</AlertTitle>
                    <AlertDescription>
                      {t('products.auctionNoticeDesc')}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={mutation.isPending}
            >
              {t('common.reset')}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? t('common.saving')
                : product
                  ? t('common.update')
                  : t('common.create')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
