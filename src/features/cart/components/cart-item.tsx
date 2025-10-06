// features/cart/components/cart-item.tsx (ENHANCED)

import { HighlightWrapper } from '@/features/shared/highlight/components/highlight-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import { useI18n } from '@/features/shared/i18n'
import { CartItemWithProduct } from '../schemas/cart.schema'

interface CartItemProps {
  item: CartItemWithProduct
  isHighlighted?: boolean
  onHighlightEnd?: () => void
}

export function CartItem({
  item,
  isHighlighted,
  onHighlightEnd,
}: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()
  const { t } = useI18n()

  // FIX: updateQuantity expects an object with productId and quantity
  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity({
      productId: item.productId,
      quantity: Math.max(1, newQuantity), // Ensure minimum of 1
    })
  }

  const handleRemove = () => {
    removeFromCart(item.productId)
  }

  return (
    <HighlightWrapper
      id={`cart-item-${item.productId}`}
      type="pulse"
      className="p-4 border rounded-lg"
      onHighlightEnd={onHighlightEnd}
      scrollIntoView={isHighlighted}
    >
      <div className="flex gap-4">
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="w-20 h-20 object-cover rounded"
        />

        <div className="flex-1">
          <h4 className="font-medium">{item.product.name}</h4>
          <p className="text-sm text-muted-foreground">
            {formatPrice(item.priceAtAdd)}
          </p>

          {item.product.type === 'auction' ? (
            <p className="text-sm text-primary">
              {t('cart.bidAmount')}: {formatPrice(item.bidAmount || '0')}
            </p>
          ) : (
            <div className="flex items-center gap-2 mt-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>

              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => {
                  const newQuantity = parseInt(e.target.value) || 1
                  handleQuantityChange(newQuantity)
                }}
                className="w-16 h-8 text-center"
                min="1"
              />

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => handleQuantityChange(item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </HighlightWrapper>
  )
}
