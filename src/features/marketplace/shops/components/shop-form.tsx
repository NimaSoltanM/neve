// features/shops/components/shop-form.tsx

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
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
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/features/shared/i18n'
import { generateSlug, cn } from '@/lib/utils'
import {
  Store,
  AlertCircle,
  Globe,
  CheckCircle,
  Rocket,
  Languages,
  Link as LinkIcon,
  Info,
  ImageIcon,
  Loader2,
} from 'lucide-react'
import { createShop, updateShop, getMyShop } from '../actions'
import { checkSlugAvailability } from '../actions/check-slug-availability'

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Shop name must be at least 2 characters')
    .max(50, 'Shop name cannot exceed 50 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug cannot exceed 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug can only contain lowercase letters, numbers and hyphens',
    ),
  descriptionEn: z.string().max(500).optional(),
  descriptionFa: z.string().max(500).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
})

type ShopFormValues = z.infer<typeof formSchema>

interface ShopFormProps {
  mode: 'create' | 'update'
  initialData?: {
    name: string
    slug?: string
    description?: { en: string; fa: string } | null
    logo?: string | null
    banner?: string | null
  }
  onSuccess?: () => void
}

export function ShopForm({ mode, initialData, onSuccess }: ShopFormProps) {
  const { t, locale, dir } = useI18n()
  const navigate = useNavigate()
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<
    boolean | null | 'checking'
  >(null)
  const formRef = useRef<HTMLFormElement>(null)

  const { data: existingShop, isLoading } = useQuery({
    queryKey: ['myShop'],
    queryFn: async () => getMyShop(),
    enabled: mode === 'create',
  })

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      slug: initialData?.slug || '',
      descriptionEn: initialData?.description?.en || '',
      descriptionFa: initialData?.description?.fa || '',
      logo: initialData?.logo || '',
      banner: initialData?.banner || '',
    },
  })

  const nameValue = form.watch('name')
  const slugValue = form.watch('slug')

  const hasPersian = /[\u0600-\u06FF]/.test(nameValue || '')

  // 🔹 Auto-generate slug
  useEffect(() => {
    if (mode === 'create' && !isSlugManual && nameValue && !hasPersian) {
      form.setValue('slug', generateSlug(nameValue))
    }
  }, [nameValue, isSlugManual, form, mode, hasPersian])

  // 🔹 Real-time slug availability check
  useEffect(() => {
    if (mode === 'create' && slugValue && slugValue.length >= 3) {
      setSlugAvailable('checking')

      const timer = setTimeout(async () => {
        try {
          const result = await checkSlugAvailability({ data: slugValue })
          if (result.success) {
            setSlugAvailable(result.available ?? null)
          } else {
            setSlugAvailable(null)
          }
        } catch (error) {
          setSlugAvailable(null)
        }
      }, 500) // Debounce 500ms

      return () => clearTimeout(timer)
    } else {
      setSlugAvailable(null)
    }
  }, [slugValue, mode])

  // 🔹 Auto-scroll to first error
  useEffect(() => {
    const subscription = form.watch((_, { name }) => {
      if (form.formState.errors[name as keyof ShopFormValues]) {
        const el = formRef.current?.querySelector(`[name="${name}"]`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const createMutation = useMutation({
    mutationFn: async (values: ShopFormValues) => {
      return createShop({
        data: {
          name: values.name,
          slug: values.slug,
          description: {
            en: values.descriptionEn || '',
            fa: values.descriptionFa || '',
          },
        },
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('shops.created'))
        onSuccess?.()
        navigate({ to: '/shop' })
      } else toast.error(result.error || t('common.error'))
    },
    onError: () => toast.error(t('common.error')),
  })

  const updateMutation = useMutation({
    mutationFn: async (values: ShopFormValues) => {
      return updateShop({
        data: {
          name: values.name,
          description: {
            en: values.descriptionEn || '',
            fa: values.descriptionFa || '',
          },
          logo: values.logo,
          banner: values.banner,
        },
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('shops.updated'))
        onSuccess?.()
      } else toast.error(result.error || t('common.error'))
    },
    onError: () => toast.error(t('common.error')),
  })

  const onSubmit = (values: ShopFormValues) => {
    if (mode === 'create') createMutation.mutate(values)
    else updateMutation.mutate(values)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // 🔹 Existing shop info
  if (
    mode === 'create' &&
    !isLoading &&
    existingShop?.success &&
    existingShop.data
  ) {
    return (
      <Card className="max-w-2xl mx-auto mt-8" dir={dir}>
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <CardTitle>{t('shops.alreadyHaveShop')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Store className="h-4 w-4" />
            <AlertTitle>{existingShop.data.name}</AlertTitle>
            <AlertDescription>
              {existingShop.data.description?.[locale as 'en' | 'fa'] ||
                t('shops.noDescription')}
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate({ to: '/shop' })}
              className="flex-1"
            >
              {t('shops.manageShop')}
            </Button>
            <Button variant="outline">{t('shops.viewShop')}</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32" dir={dir}>
      {mode === 'create' && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {t('shops.startBusiness')}
                </CardTitle>
                <CardDescription className="text-base mt-1">
                  {t('shops.createShopDesc')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          ref={formRef}
          className="space-y-8"
        >
          {/* Basic info */}
          <Card className="overflow-hidden shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                <CardTitle>{t('shops.basicInfo')}</CardTitle>
              </div>
              <CardDescription>
                {mode === 'create'
                  ? t('shops.basicInfoDesc')
                  : t('shops.updateInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      {t('shops.shopName')}{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('shops.shopNamePlaceholder')}
                        {...field}
                        disabled={isSubmitting}
                        className="text-lg"
                      />
                    </FormControl>
                    <FormDescription>
                      {t('shops.shopNameHelper')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              {mode === 'create' && (
                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        {t('shops.shopUrl')}{' '}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div
                          className="relative flex items-center gap-2"
                          dir="ltr"
                        >
                          <span className="inline-flex items-center px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground">
                            {t('shops.urlPrefix')}
                          </span>
                          <Input
                            {...field}
                            placeholder={t('shops.shopUrlPlaceholder')}
                            disabled={isSubmitting || hasPersian}
                            onChange={(e) => {
                              field.onChange(e)
                              setIsSlugManual(true)
                            }}
                            className="font-mono"
                          />
                          {slugAvailable !== null && slugValue && (
                            <div
                              className={cn(
                                'absolute right-3 top-1/2 -translate-y-1/2',
                                slugAvailable === 'checking' &&
                                  'text-muted-foreground',
                                slugAvailable === true &&
                                  'text-green-600 dark:text-green-400',
                                slugAvailable === false && 'text-destructive',
                              )}
                            >
                              {slugAvailable === 'checking' && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              )}
                              {slugAvailable === true && (
                                <CheckCircle className="h-4 w-4" />
                              )}
                              {slugAvailable === false && (
                                <AlertCircle className="h-4 w-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        {hasPersian
                          ? t('shops.persianDetected')
                          : t('shops.shopUrlHelper')}
                      </FormDescription>

                      {/* Slug availability status */}
                      {mode === 'create' &&
                        slugValue &&
                        slugValue.length >= 3 &&
                        !hasPersian && (
                          <p
                            className={cn(
                              'text-sm font-medium mt-1',
                              slugAvailable === 'checking' &&
                                'text-muted-foreground',
                              slugAvailable === true &&
                                'text-green-600 dark:text-green-400',
                              slugAvailable === false && 'text-destructive',
                            )}
                          >
                            {slugAvailable === 'checking' &&
                              `⏳ ${t('shops.checkingAvailability')}`}
                            {slugAvailable === true &&
                              `✓ ${t('shops.slugAvailable')}`}
                            {slugAvailable === false &&
                              `✗ ${t('shops.slugTaken')}`}
                          </p>
                        )}

                      {slugValue && !hasPersian && (
                        <p className="text-sm text-muted-foreground mt-1">
                          🌐 {t('shops.liveUrlPreview')}:{' '}
                          <span className="font-mono underline">
                            {t('shops.urlPrefix')}
                            {slugValue}
                          </span>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                <CardTitle>{t('shops.description')}</CardTitle>
              </div>
              <CardDescription>{t('shops.descriptionHelper')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full overflow-hidden">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="en" className="gap-2">
                    <Globe className="h-4 w-4" /> English
                  </TabsTrigger>
                  <TabsTrigger value="fa" className="gap-2">
                    <Globe className="h-4 w-4" /> فارسی
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('shops.descriptionEn')}
                          <Badge variant="secondary" className="ms-2">
                            {t('common.optional')}
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            dir="ltr"
                            className="resize-none"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500{' '}
                          {t('common.characters')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="fa" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="descriptionFa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t('shops.descriptionFa')}
                          <Badge variant="secondary" className="ms-2">
                            {t('common.optional')}
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={5}
                            dir="rtl"
                            className="resize-none"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormDescription dir="rtl">
                          {field.value?.length || 0}/500{' '}
                          {t('common.characters')}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Branding (update) */}
          {mode === 'update' && (
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  <CardTitle>{t('shops.branding')}</CardTitle>
                </div>
                <CardDescription>{t('shops.brandingHelper')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('shops.logo')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          placeholder={t('shops.logoPlaceholder')}
                        />
                      </FormControl>
                      <FormDescription>{t('shops.logoHelper')}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="banner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('shops.banner')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting}
                          placeholder={t('shops.bannerPlaceholder')}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('shops.bannerHelper')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Info alert */}
          {mode === 'create' && (
            <Alert className="shadow-sm">
              <Info className="h-4 w-4" />
              <AlertTitle>{t('shops.beforeContinue')}</AlertTitle>
              <AlertDescription className="space-y-2 mt-2">
                <p>• {t('shops.urlNoChange')}</p>
                <p>• {t('shops.addLaterInfo')}</p>
                <p>• {t('shops.oneShopPerUser')}</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Footer buttons */}
          <div className="sticky bottom-0 left-0 right-0 flex flex-col sm:flex-row gap-3 p-4 bg-background/95 backdrop-blur-md border-t shadow-sm z-10 rounded-t-lg">
            <Button
              type="submit"
              size="lg"
              disabled={
                isSubmitting || (mode === 'create' && slugAvailable !== true)
              }
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full me-2" />
                  {mode === 'create'
                    ? t('shops.creating')
                    : t('shops.updating')}
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 me-2" />
                  {mode === 'create'
                    ? t('shops.createShop')
                    : t('shops.updateShop')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate({ to: '/dashboard' })}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
