import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
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
import { generateSlug } from '@/lib/utils'
import {
  Store,
  AlertCircle,
  Globe,
  CheckCircle,
  Rocket,
  Languages,
  Link as LinkIcon,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createShop, getMyShop } from '../actions'

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
  descriptionEn: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  descriptionFa: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
})

type ShopFormValues = z.infer<typeof formSchema>

interface ShopFormProps {
  onSuccess?: () => void
}

export function ShopForm({ onSuccess }: ShopFormProps) {
  const { t, locale, dir } = useI18n()
  const navigate = useNavigate()
  const [isSlugManual, setIsSlugManual] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  // Check if user already has a shop
  const { data: existingShop, isLoading } = useQuery({
    queryKey: ['myShop'],
    queryFn: async () => getMyShop(),
  })

  const form = useForm<ShopFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      descriptionEn: '',
      descriptionFa: '',
    },
  })

  // Auto-generate slug from name
  const nameValue = form.watch('name')
  const slugValue = form.watch('slug')

  useEffect(() => {
    if (!isSlugManual && nameValue) {
      const hasPersian =
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
          nameValue,
        )

      if (!hasPersian) {
        const generatedSlug = generateSlug(nameValue)
        form.setValue('slug', generatedSlug)
      }
    }
  }, [nameValue, isSlugManual, form])

  // Check slug availability (debounced)
  useEffect(() => {
    if (slugValue && slugValue.length >= 3) {
      const timer = setTimeout(() => {
        // In real app, make API call to check slug
        // For now, just set as available
        setSlugAvailable(true)
      }, 500)

      return () => clearTimeout(timer)
    } else {
      setSlugAvailable(null)
    }
  }, [slugValue])

  // Create shop mutation
  const mutation = useMutation({
    mutationFn: async (values: ShopFormValues) => {
      const data = {
        name: values.name,
        slug: values.slug,
        description: {
          en: values.descriptionEn || '',
          fa: values.descriptionFa || '',
        },
      }

      return createShop({ data })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('shops.shopCreatedSuccessfully'))
        onSuccess?.()
        navigate({ to: '/dashboard' })
      } else {
        toast.error(result.error || t('common.error'))
      }
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const onSubmit = (values: ShopFormValues) => {
    mutation.mutate(values)
  }

  const hasPersianInName =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
      nameValue || '',
    )

  // If user already has a shop
  if (!isLoading && existingShop?.success && existingShop.data) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <CardTitle>You Already Have a Shop!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Store className="h-4 w-4" />
            <AlertTitle>{existingShop.data.name}</AlertTitle>
            <AlertDescription>
              {existingShop.data.description?.[locale as 'en' | 'fa'] ||
                'No description'}
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate({ to: '/dashboard' })}
              className="flex-1"
            >
              {t('shops.manage')} {t('shops.viewShop')}
            </Button>
            <Button
              variant="outline"
              //   onClick={() =>
              //     navigate({
              //       to: '/shops/$slug',
              //       params: { slug: existingShop.data.slug },
              //     })
              //   }
            >
              {t('shops.viewShop')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir={dir}>
      {/* Welcome Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Rocket className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {t('shops.startYourBusiness')}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {t('shops.createShopToday')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit) as any}
          className="space-y-6"
        >
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                <CardTitle>{t('shops.basicInformation')}</CardTitle>
              </div>
              <CardDescription>
                Choose a name and URL for your shop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Shop Name */}
              <FormField
                control={form.control as any}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Shop Name
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My Amazing Shop"
                        {...field}
                        className="text-lg"
                      />
                    </FormControl>
                    <FormDescription>
                      This is your shop's display name that customers will see
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* URL Slug */}
              <FormField
                control={form.control as any}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <LinkIcon className="h-4 w-4" />
                      Shop URL
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-3 rounded-s-md border border-e-0 border-input bg-muted text-sm text-muted-foreground">
                            yoursite.com/shops/
                          </span>
                          <Input
                            placeholder="my-shop"
                            {...field}
                            dir="ltr"
                            className="rounded-s-none font-mono"
                            onChange={(e) => {
                              field.onChange(e)
                              setIsSlugManual(true)
                            }}
                          />
                        </div>
                        {hasPersianInName && !isSlugManual && (
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 end-0"
                          >
                            Manual entry required
                          </Badge>
                        )}
                        {slugAvailable !== null && slugValue && (
                          <div
                            className={cn(
                              'absolute end-3 top-1/2 -translate-y-1/2',
                              slugAvailable
                                ? 'text-green-600'
                                : 'text-destructive',
                            )}
                          >
                            {slugAvailable ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      {hasPersianInName
                        ? 'Persian text detected. Please enter an English URL.'
                        : 'This will be your unique shop URL. Choose carefully as this cannot be changed later.'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Shop Description */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                <CardTitle>Shop Description</CardTitle>
              </div>
              <CardDescription>
                Describe your shop in both English and Persian for better reach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="en" className="gap-2">
                    <Globe className="h-4 w-4" />
                    English
                  </TabsTrigger>
                  <TabsTrigger value="fa" className="gap-2">
                    <Globe className="h-4 w-4" />
                    فارسی
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <FormField
                    control={form.control as any}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          English Description
                          <Badge variant="secondary" className="ms-2">
                            Optional
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what you sell, your specialties, and what makes your shop unique..."
                            {...field}
                            rows={5}
                            className="resize-none"
                            dir="ltr"
                          />
                        </FormControl>
                        <FormDescription>
                          {field.value?.length || 0}/500 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="fa" className="space-y-4 mt-4">
                  <FormField
                    control={form.control as any}
                    name="descriptionFa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          توضیحات فارسی
                          <Badge variant="secondary" className="ms-2">
                            اختیاری
                          </Badge>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="فروشگاه خود را توصیف کنید..."
                            {...field}
                            rows={5}
                            className="resize-none"
                            dir="rtl"
                          />
                        </FormControl>
                        <FormDescription dir="rtl">
                          {field.value?.length || 0}/500 کاراکتر
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle>Before You Continue</AlertTitle>
            <AlertDescription className="space-y-2 mt-2">
              <p>• Your shop URL cannot be changed after creation</p>
              <p>
                • You can add logo, banner, and more details after creating your
                shop
              </p>
              <p>• Each user can only have one shop</p>
            </AlertDescription>
          </Alert>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6 -mx-6 border-t">
            <Button
              type="submit"
              disabled={mutation.isPending || !slugAvailable}
              className="flex-1 h-12"
              size="lg"
            >
              {mutation.isPending ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full me-2" />
                  {t('shops.creatingShop')}
                </>
              ) : (
                <>
                  <Store className="h-4 w-4 me-2" />
                  {t('shops.createShop')}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-12"
              onClick={() => navigate({ to: '/dashboard' })}
              disabled={mutation.isPending}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
