import { useQuery } from '@tanstack/react-query'
import { getProductBySlug } from '../actions'

export function useLiveProduct(product: {
  slug: string
  type: 'regular' | 'auction'
  auctionEndsAt?: Date | null
}) {
  const isAuction = product.type === 'auction'
  const hasEnded =
    product.auctionEndsAt && new Date() > new Date(product.auctionEndsAt)

  return useQuery({
    queryKey: ['product', product.slug],
    queryFn: async () => {
      const result = await getProductBySlug({ data: product.slug })
      if (!result.success) throw new Error(result.error)
      return result.data
    },
    refetchInterval: isAuction && !hasEnded ? 5000 : false,
    refetchOnWindowFocus: isAuction,
    placeholderData: (previousData) => previousData,
  })
}
