import { useCart } from '@/features/cart/hooks/use-cart'
import { toast } from 'sonner'
import { useI18n } from '@/features/shared/i18n'
import { ProductCard } from './product-card'

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
    } else {
      toast.error(t('common.error'))
    }
  }

  return <ProductCard product={product} onAddToCart={handleAddToCart} />
}
