import { useCart } from '@/features/cart/hooks/use-cart'
import { toast } from 'sonner'
import { useI18n } from '@/features/shared/i18n'
import { ProductCard } from '../products/components/product-card'

export function ProductCardWithCart({ product }: { product: any }) {
  const { t } = useI18n()
  const { addToCart } = useCart()

  const handleAddToCart = async () => {
    const result = await addToCart({
      productId: product.id,
      quantity: 1,
      bidAmount: product.type === 'auction' ? product.buyNowPrice : undefined,
    })

    if (result.success) {
      toast.success(t('cart.addedToCart'))
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  const handlePlaceBid = async () => {
    // For now just add to cart with bid amount
    // Later this will open a bid dialog
    const nextBid = product.currentBid
      ? (
          parseFloat(product.currentBid) +
          parseFloat(product.bidIncrement || '1')
        ).toString()
      : product.startingPrice

    const result = await addToCart({
      productId: product.id,
      quantity: 1,
      bidAmount: nextBid,
    })

    if (result.success) {
      toast.success(t('marketplace.bidPlaced'))
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  return (
    <ProductCard
      product={product}
      onAddToCart={handleAddToCart}
      onPlaceBid={handlePlaceBid}
    />
  )
}
