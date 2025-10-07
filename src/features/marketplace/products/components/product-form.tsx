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
import { generateSlug, formatPrice } from '@/lib/utils'
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

// Helper to convert Toman to Dollar (100,000 Toman = 1 Dollar)
const tomanToDollar = (toman: string): string => {
  const cleaned = toman.replace(/[^\d.]/g, '')
  const numeric = parseFloat(cleaned)
  if (isNaN(numeric)) return '0'
  return (numeric / 100000).toFixed(2)
}

// Helper to convert Dollar to Toman
const dollarToToman = (dollar: string): string => {
  const numeric = parseFloat(dollar)
  if (isNaN(numeric)) return '0'
  return Math.round(numeric * 100000).toString()
}

// Helper to format number with Persian digits
const toPersianNumber = (num: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return num.replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}

// Helper to convert Persian digits to English
const toEnglishNumber = (str: string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']

  let result = str
  persianDigits.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, 'g'), index.toString())
  })
  arabicDigits.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), index.toString())
  })
  return result
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  console.log('Product in form:', product) // Add this line
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
      images: product?.images
        ? product.images.map((url: string) => {
            const fileName = url.split('/').pop() || ''
            const extension = fileName.split('.').pop()?.toLowerCase() || ''

            // Determine MIME type from extension
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

  const nameValue = form.watch('name')
  const typeValue = form.watch('type')

  // Auto-generate slug from name
  useEffect(() => {
    if (!isSlugManual && nameValue) {
      const newSlug = generateSlug(nameValue)
      form.setValue('slug', newSlug)
    }
  }, [nameValue, isSlugManual, form])

  // Update product type state
  useEffect(() => {
    setProductType(typeValue)
  }, [typeValue])

  // Fetch user shops
  const { data: shopsData, isLoading: shopsLoading } = useQuery({
    queryKey: ['user-shops'],
    queryFn: () => getUserShops(),
  })

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  })

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const data = {
        ...values,
        shopId: parseInt(values.shopId),
        categoryId: parseInt(values.categoryId),
        images: values.images.map((img: UploadedFile) => img.url),
        stock: values.stock ? parseInt(values.stock) : undefined,
        auctionEndsAt: values.auctionEndsAt?.toISOString(),
        price: values.price && values.price !== '' ? values.price : undefined,
        startingPrice:
          values.startingPrice && values.startingPrice !== ''
            ? values.startingPrice
            : undefined,
        bidIncrement:
          values.bidIncrement && values.bidIncrement !== ''
            ? values.bidIncrement
            : '1.00',
        buyNowPrice:
          values.buyNowPrice && values.buyNowPrice !== ''
            ? values.buyNowPrice
            : undefined,
      }

      if (product?.id) {
        console.log('Updating product with id:', product.id, 'data:', data)
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
  const isPersian = locale === 'fa'

  // Price conversion helpers
  const handlePriceInput = (value: string, onChange: (val: string) => void) => {
    const cleanValue = toEnglishNumber(value.replace(/[^\d.]/g, ''))

    if (isPersian) {
      // Convert Toman to Dollar for storage
      const dollarValue = tomanToDollar(cleanValue)
      onChange(dollarValue)
    } else {
      onChange(cleanValue)
    }
  }

  const displayPrice = (dollarValue: string): string => {
    if (!dollarValue) return ''

    if (isPersian) {
      const tomanValue = dollarToToman(dollarValue)
      return toPersianNumber(
        new Intl.NumberFormat('fa-IR').format(parseInt(tomanValue)),
      )
    }
    return dollarValue
  }

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

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Form {...form}>
        <div className="mb-6 flex items-center justify-between">
          <LanguageSwitcher />
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit) as any}
          className="space-y-6"
          dir={dir}
        >
          {/* Product Type Selection */}
          {!product && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <CardTitle>{t('products.productType')}</CardTitle>
                </div>
                <CardDescription>
                  {t('products.selectProductType')}
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
                          <div
                            className={cn(
                              'flex items-start space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer transition-colors',
                              field.value === 'regular'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50',
                              isPersian && 'space-x-reverse',
                            )}
                          >
                            <RadioGroupItem value="regular" id="regular" />
                            <label
                              htmlFor="regular"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 font-semibold">
                                <DollarSign className="h-4 w-4" />
                                {t('shops.regularProduct')}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {t('products.regularDesc')}
                              </p>
                            </label>
                          </div>
                          <div
                            className={cn(
                              'flex items-start space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer transition-colors',
                              field.value === 'auction'
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50',
                              isPersian && 'space-x-reverse',
                            )}
                          >
                            <RadioGroupItem value="auction" id="auction" />
                            <label
                              htmlFor="auction"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center gap-2 font-semibold">
                                <Gavel className="h-4 w-4" />
                                {t('shops.auctionProduct')}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {t('products.auctionDesc')}
                              </p>
                            </label>
                          </div>
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
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {t('products.basicInformation')}
              </CardTitle>
              <CardDescription>
                {t('products.basicInformationDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                        disabled={!!product}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t('products.selectShop')}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shopsData?.data?.map((shop: any) => (
                            <SelectItem
                              key={shop.id}
                              value={shop.id.toString()}
                            >
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

              {/* Product Name */}
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {t('products.productName')}
                        <span className="text-destructive">*</span>
                      </span>
                      {hasPersianInName && (
                        <Badge variant="outline" className="text-xs">
                          <Info className="h-3 w-3 me-1" />
                          {t('products.persianNameWarning')}
                        </Badge>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('products.productNamePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/200 {t('common.characters')}
                    </FormDescription>
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
                    <FormLabel>{t('products.slug')}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="product-slug"
                        {...field}
                        onChange={(e) => {
                          setIsSlugManual(true)
                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                    <FormDescription>{t('products.slugDesc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        placeholder={t(
                          'products.productDescriptionPlaceholder',
                        )}
                        {...field}
                        rows={5}
                        className="resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/2000 {t('common.characters')}
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
                        multiple
                        accept="image/*"
                        value={field.value}
                        onChange={field.onChange}
                        category="products"
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/10 {t('common.images')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {productType === 'auction' ? (
                  <Gavel className="h-5 w-5" />
                ) : (
                  <Coins className="h-5 w-5" />
                )}
                <CardTitle>
                  {productType === 'auction'
                    ? t('products.auctionPricing')
                    : t('products.pricingInventory')}
                </CardTitle>
              </div>
              <CardDescription>
                {productType === 'auction'
                  ? t('products.auctionPricingDesc')
                  : t('products.pricingInventoryDesc')}
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
                              {isPersian ? <Coins className="h-4 w-4" /> : '$'}
                            </span>
                            <Input
                              type="text"
                              placeholder={isPersian ? '۱۰۰,۰۰۰' : '0.00'}
                              className={cn(
                                'ps-8',
                                isPersian ? 'pe-16' : 'pe-4',
                              )}
                              value={displayPrice(field.value || '')}
                              onChange={(e) =>
                                handlePriceInput(e.target.value, field.onChange)
                              }
                            />
                            {isPersian && (
                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                تومان
                              </span>
                            )}
                          </div>
                        </FormControl>
                        {isPersian && field.value && (
                          <FormDescription>
                            ≈ {formatPrice(field.value, { locale: 'en' })}
                          </FormDescription>
                        )}
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
                            value={
                              isPersian && field.value
                                ? toPersianNumber(field.value)
                                : field.value
                            }
                            onChange={(e) => {
                              const englishValue = toEnglishNumber(
                                e.target.value,
                              )
                              field.onChange(englishValue)
                            }}
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
                                placeholder={isPersian ? '۱۰۰,۰۰۰' : '0.00'}
                                className={cn(
                                  'ps-8',
                                  isPersian ? 'pe-16' : 'pe-4',
                                )}
                                value={displayPrice(field.value || '')}
                                onChange={(e) =>
                                  handlePriceInput(
                                    e.target.value,
                                    field.onChange,
                                  )
                                }
                              />
                              {isPersian && (
                                <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                  تومان
                                </span>
                              )}
                            </div>
                          </FormControl>
                          {isPersian && field.value && (
                            <FormDescription>
                              ≈ {formatPrice(field.value, { locale: 'en' })}
                            </FormDescription>
                          )}
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
                                placeholder={isPersian ? '۱۰,۰۰۰' : '1.00'}
                                className={cn(
                                  'ps-8',
                                  isPersian ? 'pe-16' : 'pe-4',
                                )}
                                value={displayPrice(field.value || '1.00')}
                                onChange={(e) =>
                                  handlePriceInput(
                                    e.target.value,
                                    field.onChange,
                                  )
                                }
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
                  </div>

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
                              {isPersian ? <Coins className="h-4 w-4" /> : '$'}
                            </span>
                            <Input
                              type="text"
                              placeholder={isPersian ? '۵۰۰,۰۰۰' : '0.00'}
                              className={cn(
                                'ps-8',
                                isPersian ? 'pe-16' : 'pe-4',
                              )}
                              value={displayPrice(field.value || '')}
                              onChange={(e) =>
                                handlePriceInput(e.target.value, field.onChange)
                              }
                            />
                            {isPersian && (
                              <span className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                تومان
                              </span>
                            )}
                          </div>
                        </FormControl>
                        {isPersian && field.value && (
                          <FormDescription>
                            ≈ {formatPrice(field.value, { locale: 'en' })}
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
                                  <span>{t('products.pickDate')}</span>
                                )}
                                <CalendarIcon
                                  className={cn(
                                    'ms-auto h-4 w-4 opacity-50',
                                    isPersian && 'me-auto ms-0',
                                  )}
                                />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() ||
                                date > addDays(new Date(), 90)
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
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              size="lg"
              className="min-w-32"
            >
              {mutation.isPending
                ? t('common.loading')
                : product
                  ? t('common.save')
                  : t('products.addProduct')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
