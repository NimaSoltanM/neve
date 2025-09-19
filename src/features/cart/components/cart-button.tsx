import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../hooks/use-cart'
import { useCartPersistence } from '../hooks/use-cart-persistence'
import { useState } from 'react'
import { CartDrawer } from './cart-drawer'

export function CartButton() {
  const { itemCount } = useCart()
  const [open, setOpen] = useState(false)

  useCartPersistence()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge
            className="absolute -top-1 -end-1 h-5 w-5 p-0 flex items-center justify-center"
            variant="destructive"
          >
            {itemCount > 99 ? '99+' : itemCount}
          </Badge>
        )}
      </Button>

      <CartDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}
