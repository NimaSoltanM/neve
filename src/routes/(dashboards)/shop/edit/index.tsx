import { createFileRoute, redirect } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getMyShop } from '@/features/marketplace/shops/actions'
import { ShopForm } from '@/features/marketplace/shops/components/shop-form'

export const Route = createFileRoute('/(dashboards)/shop/edit/')({
  beforeLoad: async () => {
    // Check if user has a shop
    const result = await getMyShop()

    if (!result.success || !result.data) {
      // User doesn't have a shop, redirect to create
      throw redirect({
        to: '/shop',
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['myShop'],
    queryFn: async () => getMyShop(),
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!data?.success || !data.data) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <ShopForm
        mode="update"
        initialData={{
          name: data.data.name,
          slug: data.data.slug,
          description: data.data.description,
          logo: data.data.logo,
          banner: data.data.banner,
        }}
      />
    </div>
  )
}
