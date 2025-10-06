// features/shops/components/shop-settings.tsx

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { FileUpload } from '@/features/shared/upload/components/file-upload'
import { useI18n } from '@/features/shared/i18n'
import {
  Globe,
  Loader2,
  ImageIcon,
  Rocket,
  AlertCircle,
  CheckCircle2,
  Store,
  Power,
  Sparkles,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getMyShop, updateShop, toggleShopActivation } from '../actions'
import type { UploadedFile } from '@/features/shared/upload/types/upload.types'

const formSchema = z.object({
  descriptionEn: z.string().max(500).optional(),
  descriptionFa: z.string().max(500).optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ShopSettings() {
  const { t, locale, dir } = useI18n()
  const queryClient = useQueryClient()
  const [logo, setLogo] = useState<UploadedFile | null>(null)
  const [banner, setBanner] = useState<UploadedFile | null>(null)
  const [activationDialogOpen, setActivationDialogOpen] = useState(false)
  const [pendingActivationState, setPendingActivationState] = useState(false)

  // Load shop data
  const { data: shopData, isLoading } = useQuery({
    queryKey: ['myShop'],
    queryFn: async () => getMyShop(),
  })

  const shop = shopData?.data

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descriptionEn: '',
      descriptionFa: '',
    },
  })

  // Update form when shop data loads
  useEffect(() => {
    if (shop) {
      form.reset({
        descriptionEn: shop.description?.en || '',
        descriptionFa: shop.description?.fa || '',
      })

      // Set existing images if available
      if (shop.logo) {
        setLogo({
          id: 'existing-logo',
          url: shop.logo,
          name: 'logo',
          size: 0,
          type: 'image/*',
        })
      }
      if (shop.banner) {
        setBanner({
          id: 'existing-banner',
          url: shop.banner,
          name: 'banner',
          size: 0,
          type: 'image/*',
        })
      }
    }
  }, [shop, form])

  // Update shop mutation
  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      return updateShop({
        data: {
          description: {
            en: values.descriptionEn || '',
            fa: values.descriptionFa || '',
          },
          logo: logo?.url,
          banner: banner?.url,
        },
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('shops.settingsUpdated'))
        queryClient.invalidateQueries({ queryKey: ['myShop'] })
      } else {
        toast.error(result.error || t('common.error'))
      }
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  // Toggle activation mutation
  const activationMutation = useMutation({
    mutationFn: async (isActive: boolean) => {
      return toggleShopActivation({
        data: { isActive },
      })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          result.data?.isActive
            ? t('shops.activationSuccess')
            : t('shops.deactivationSuccess'),
        )
        queryClient.invalidateQueries({ queryKey: ['myShop'] })
        setActivationDialogOpen(false)
      } else {
        toast.error(result.error || t('common.error'))
      }
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const onSubmit = (values: FormValues) => {
    updateMutation.mutate(values)
  }

  const handleActivationClick = (newState: boolean) => {
    setPendingActivationState(newState)
    setActivationDialogOpen(true)
  }

  const confirmActivation = () => {
    activationMutation.mutate(pendingActivationState)
  }

  if (isLoading) {
    return (
      <div className="space-y-6" dir={dir}>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shop) {
    return null
  }

  const isActive = shop.isActive

  return (
    <div className="space-y-6" dir={dir}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('shops.settings')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('shops.settingsDesc')}</p>
      </div>

      {/* Shop Status Card */}
      <Card
        className={cn(
          'border-2 transition-colors',
          isActive
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
            : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20',
        )}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div
                className={cn(
                  'p-3 rounded-full shrink-0',
                  isActive
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : 'bg-amber-100 dark:bg-amber-900/40',
                )}
              >
                {isActive ? (
                  <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Power className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="flex items-center gap-2 flex-wrap">
                  {t('shops.shopStatus')}
                  <Badge
                    variant={isActive ? 'default' : 'secondary'}
                    className={cn(
                      'shrink-0',
                      isActive &&
                        'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white',
                    )}
                  >
                    {isActive ? t('shops.active') : t('shops.inactive')}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1.5">
                  {isActive
                    ? t('shops.shopActiveDesc')
                    : t('shops.shopInactiveDesc')}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert
            className={cn(
              'border-2',
              isActive
                ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20'
                : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20',
            )}
          >
            <Info
              className={cn(
                'h-4 w-4',
                isActive
                  ? 'text-green-600 dark:text-green-500'
                  : 'text-amber-600 dark:text-amber-500',
              )}
            />
            <AlertTitle className="font-semibold">
              {isActive ? t('shops.whatsNext') : t('shops.readyToLaunch')}
            </AlertTitle>
            <AlertDescription className="mt-2">
              {isActive
                ? t('shops.activeShopInfo')
                : t('shops.inactiveShopInfo')}
            </AlertDescription>
          </Alert>

          <div className="flex flex-wrap gap-3">
            {isActive ? (
              <Button
                variant="destructive"
                onClick={() => handleActivationClick(false)}
                disabled={activationMutation.isPending}
              >
                {activationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {t('shops.deactivating')}
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4 me-2" />
                    {t('shops.deactivateShop')}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => handleActivationClick(true)}
                disabled={activationMutation.isPending}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
              >
                {activationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                    {t('shops.activating')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 me-2" />
                    {t('shops.activateShop')}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Shop Details Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Branding Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t('shops.branding')}</CardTitle>
              </div>
              <CardDescription>{t('shops.brandingDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <FormLabel>{t('shops.logo')}</FormLabel>
                <FileUpload
                  accept="image/*"
                  maxSize={2}
                  value={logo}
                  onChange={(file) => setLogo(file as UploadedFile | null)}
                  category="shops"
                  disabled={updateMutation.isPending}
                />
                <FormDescription>{t('shops.logoHelper')}</FormDescription>
              </div>

              {/* Banner Upload */}
              <div className="space-y-2">
                <FormLabel>{t('shops.banner')}</FormLabel>
                <FileUpload
                  accept="image/*"
                  maxSize={5}
                  value={banner}
                  onChange={(file) => setBanner(file as UploadedFile | null)}
                  category="shops"
                  disabled={updateMutation.isPending}
                />
                <FormDescription>{t('shops.bannerHelper')}</FormDescription>
              </div>
            </CardContent>
          </Card>

          {/* Description Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t('shops.description')}</CardTitle>
              </div>
              <CardDescription>{t('shops.descriptionHelper')}</CardDescription>
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
                    control={form.control}
                    name="descriptionEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('shops.descriptionEn')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('shops.descriptionEnPlaceholder')}
                            {...field}
                            rows={5}
                            className="resize-none"
                            dir="ltr"
                            disabled={updateMutation.isPending}
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
                        <FormLabel>{t('shops.descriptionFa')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('shops.descriptionFaPlaceholder')}
                            {...field}
                            rows={5}
                            className="resize-none"
                            dir="rtl"
                            disabled={updateMutation.isPending}
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

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={updateMutation.isPending} size="lg">
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t('shops.saving')}
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 me-2" />
                  {t('shops.saveChanges')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Activation Confirmation Dialog */}
      <AlertDialog
        open={activationDialogOpen}
        onOpenChange={setActivationDialogOpen}
      >
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={cn(
                  'p-3 rounded-full shrink-0',
                  pendingActivationState
                    ? 'bg-green-100 dark:bg-green-900/40'
                    : 'bg-amber-100 dark:bg-amber-900/40',
                )}
              >
                {pendingActivationState ? (
                  <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Power className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                )}
              </div>
              <AlertDialogTitle className="text-2xl">
                {pendingActivationState
                  ? t('shops.confirmActivation')
                  : t('shops.confirmDeactivation')}
              </AlertDialogTitle>
            </div>
          </AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-base text-foreground">
                {pendingActivationState
                  ? t('shops.activationDialogDesc')
                  : t('shops.deactivationDialogDesc')}
              </p>

              <Alert
                className={cn(
                  'border-2',
                  pendingActivationState
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20'
                    : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20',
                )}
              >
                <Info
                  className={cn(
                    'h-4 w-4',
                    pendingActivationState
                      ? 'text-green-600 dark:text-green-500'
                      : 'text-amber-600 dark:text-amber-500',
                  )}
                />
                <AlertTitle className="font-semibold">
                  {pendingActivationState
                    ? t('shops.activationNote')
                    : t('shops.deactivationNote')}
                </AlertTitle>
                <AlertDescription className="space-y-2 mt-2">
                  {pendingActivationState ? (
                    <>
                      <p>• {t('shops.activationPoint1')}</p>
                      <p>• {t('shops.activationPoint2')}</p>
                      <p>• {t('shops.activationPoint3')}</p>
                    </>
                  ) : (
                    <>
                      <p>• {t('shops.deactivationPoint1')}</p>
                      <p>• {t('shops.deactivationPoint2')}</p>
                      <p>• {t('shops.deactivationPoint3')}</p>
                    </>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={activationMutation.isPending}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmActivation}
              disabled={activationMutation.isPending}
              className={cn(
                pendingActivationState &&
                  'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700',
              )}
            >
              {activationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {pendingActivationState
                    ? t('shops.activating')
                    : t('shops.deactivating')}
                </>
              ) : (
                <>
                  {pendingActivationState
                    ? t('shops.yesActivate')
                    : t('shops.yesDeactivate')}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
