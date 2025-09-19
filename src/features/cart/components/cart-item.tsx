import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/features/shared/i18n'
import { useCartItem } from '../hooks/use-cart-item'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2, Gavel } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { CartItemWithProduct } from '../schemas/cart.schema'

interface CartItemProps {
  item: CartItemWithProduct
}

export function CartItem({ item }: CartItemProps) {
  const { t } = useI18n()
  const { increment, decrement, remove, quantity } = useCartItem(item.productId)

  const isAuction = item.product.type === 'auction'
  const image = item.product.images?.[0] || '/placeholder.png'

  return (
    <div className="flex gap-4">
      <Link
        to="/products/$slug"
        params={{ slug: item.product.slug }}
        className="shrink-0"
      >
        <img
          src={image}
          alt={item.product.name}
          className="h-20 w-20 rounded-lg object-cover"
        />
      </Link>

      <div className="flex-1 space-y-1">
        <Link
          to="/products/$slug"
          params={{ slug: item.product.slug }}
          className="font-medium hover:underline line-clamp-1"
        >
          {item.product.name}
        </Link>

        {isAuction ? (
          <div className="flex items-center gap-1">
            <Gavel className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t('cart.yourBid')}
            </span>
            <span className="text-sm font-medium">
              {formatPrice(item.bidAmount || '0')}
            </span>
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground">
              {formatPrice(item.product.price || '0')}
            </div>

            {/* Quantity controls for regular products */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={decrement}
              >
                <Minus className="h-3 w-3" />
              </Button>

              <span className="w-8 text-center text-sm">{quantity}</span>

              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={increment}
                disabled={
                  item.product.stock !== null && quantity >= item.product.stock
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </>
        )}

        {/* Stock warning */}
        {!isAuction &&
          item.product.stock !== null &&
          item.product.stock <= 5 && (
            <Badge variant="destructive" className="text-xs">
              {t('cart.lowStock', { count: item.product.stock })}
            </Badge>
          )}
      </div>

      <div className="flex flex-col items-end justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={remove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="text-sm font-semibold">
          {isAuction
            ? formatPrice(item.bidAmount || '0')
            : formatPrice(
                (parseFloat(item.product.price || '0') * quantity).toString(),
              )}
        </div>
      </div>
    </div>
  )
}
