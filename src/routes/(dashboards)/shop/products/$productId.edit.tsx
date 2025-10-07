import { createFileRoute, notFound, useRouter } from '@tanstack/react-router'
import { getProductForEdit } from '@/features/marketplace/products/actions/product-management.actions'
import { ProductForm } from '@/features/marketplace/products/components/product-form'
import { useI18n } from '@/features/shared/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute(
  '/(dashboards)/shop/products/$productId/edit',
)({
  loader: async ({ params }) => {
    const productId = parseInt(params.productId)
    const result = await getProductForEdit({ data: productId })

    if (!result.success || !result.data) {
      throw notFound()
    }

    return result.data
  },
  component: EditProductPage,
})

function EditProductPage() {
  const product = Route.useLoaderData()
  const router = useRouter()
  const { t, locale } = useI18n()
  const dir = locale === 'fa' ? 'rtl' : 'ltr'

  const handleSuccess = () => {
    router.navigate({ to: '/shop/products' })
  }

  const handleBack = () => {
    router.history.back()
  }

  return (
    <div dir={dir} className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 me-2" />
          {t('common.back')}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t('shops.editProduct')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm product={product} onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
