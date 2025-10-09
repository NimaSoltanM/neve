import { Button } from '@/components/ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'
import { useCart } from '../hooks/use-cart'
import { formatPrice, cn } from '@/lib/utils'
import { useI18n } from '@/features/shared/i18n'
import { CartItemWithProduct } from '../schemas/cart.schema'
import { toast } from 'sonner'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'

interface CartItemProps {
  item: CartItemWithProduct
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()
  const { t, locale } = useI18n()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    if (newQuantity > (item.product.stock || 0)) {
      toast.error(t('cart.exceedsStock'))
      return
    }
    updateQuantity({
      productId: item.productId,
      quantity: newQuantity,
    })
  }

  const handleRemove = () => {
    removeFromCart(item.productId)
    toast.success(t('cart.itemRemoved'))
  }

  const isAuction = item.product.type === 'auction'
  const itemSubtotal = item.priceAtAdd * item.quantity

  return (
    <div className="group relative bg-card border rounded-lg p-3 hover:shadow-md transition-all">
      {/* Remove button - Absolute positioned */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 end-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive z-10"
        onClick={handleRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <div className="flex gap-3">
        {/* Image */}
        <Link
          to="/marketplace/$slug"
          params={{ slug: item.product.slug }}
          className="relative shrink-0"
        >
          <div className="w-20 h-20 rounded-md overflow-hidden bg-muted">
            <img
              src={item.product.images[0]}
              alt={item.product.name}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
          {isAuction && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -start-1 text-xs px-1.5 py-0"
            >
              {t('product.auction')}
            </Badge>
          )}
        </Link>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title & Price */}
          <div className="pe-8">
            <Link
              to="/marketplace/$slug"
              params={{ slug: item.product.slug }}
              className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
            >
              {item.product.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-primary">
                {formatPrice(item.priceAtAdd)}
              </span>
              {item.quantity > 1 && (
                <>
                  <span className="text-xs text-muted-foreground">×</span>
                  <span className="text-xs text-muted-foreground">
                    {item.quantity}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quantity Controls & Subtotal */}
          <div className="flex items-center justify-between">
            {!isAuction ? (
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none"
                  onClick={() => handleQuantityChange(item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="w-8 text-center text-sm font-medium">
                  {item.quantity}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-none"
                  onClick={() => handleQuantityChange(item.quantity + 1)}
                  disabled={item.quantity >= (item.product.stock || 0)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t('product.auctionItem')}
              </span>
            )}

            {/* Subtotal */}
            {item.quantity > 1 && (
              <div className="text-sm font-semibold">
                {formatPrice(itemSubtotal)}
              </div>
            )}
          </div>

          {/* Stock warning */}
          {!isAuction && item.product.stock && item.product.stock < 5 && (
            <p className="text-xs text-amber-600 dark:text-amber-500">
              {t('product.lowStock', { count: item.product.stock })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
