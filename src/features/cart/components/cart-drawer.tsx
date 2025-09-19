import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useI18n } from '@/features/shared/i18n'
import { useCart } from '../hooks/use-cart'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatPrice } from '@/lib/utils'
import { CartItem } from './cart-item'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { t, dir } = useI18n()
  const { cart, total, hasItems, clearCart, isLoading } = useCart()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={dir === 'rtl' ? 'left' : 'right'}
        className="w-full sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('cart.title')}
          </SheetTitle>
        </SheetHeader>

        {!hasItems ? (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-2">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">{t('cart.empty')}</p>
            <Button asChild variant="default" size="sm">
              <Link to="/marketplace" onClick={() => onOpenChange(false)}>
                {t('cart.continueShopping')}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea
              className="flex-1 mt-6 mb-6"
              style={{ height: 'calc(100vh - 300px)' }}
            >
              <div className="space-y-4 pe-6">
                {cart.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>{t('cart.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>

              <SheetFooter className="flex flex-col gap-2 sm:flex-col">
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  disabled={isLoading}
                  className="w-full"
                >
                  {t('cart.clear')}
                </Button>

                <Button asChild className="w-full">
                  <Link
                    to="/checkout"
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-center gap-2"
                  >
                    {t('cart.checkout')}
                    <ArrowRight className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" />
                  </Link>
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
