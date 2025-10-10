import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { getAllShops } from '@/features/marketplace/shops/actions/get-all-shops.action'
import { ShopsList } from '@/features/marketplace/shops/components/shops-list'

const searchSchema = z.object({
  search: z.string().optional(),
  page: z.number().default(1),
})

export const Route = createFileRoute('/(root)/(marketplace)/shops/')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps: { search } }) => {
    const shopsResult = await getAllShops({
      data: {
        search: search.search,
        page: search.page,
        limit: 12,
      },
    })

    return {
      shops: shopsResult.success ? shopsResult.data : null,
    }
  },
  component: ShopsPage,
})

function ShopsPage() {
  const { shops } = Route.useLoaderData()

  return <ShopsList shops={shops} />
}
