// features/cart/components/cart-drawer.tsx

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useI18n } from '@/features/shared/i18n'
import { useCart } from '../hooks/use-cart'
import { ShoppingCart, ArrowRight, Package, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { formatPrice, cn } from '@/lib/utils'
import { CartItem } from './cart-item'
import { useState } from 'react'
import { toast } from 'sonner'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { t, dir } = useI18n()
  const { cart, total, hasItems, clearCart, isLoading } = useCart()
  const [showClearDialog, setShowClearDialog] = useState(false)

  const itemCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0

  const handleClearCart = () => {
    clearCart()
    setShowClearDialog(false)
    toast.success(t('cart.cleared'))
    onOpenChange(false)
  }

  const handleCheckout = () => {
    if (cart?.some((item) => item.product.type === 'auction')) {
      toast.error(t('cart.auctionItemsCannotCheckout'))
      return
    }
    onOpenChange(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side={dir === 'rtl' ? 'left' : 'right'}
          className="w-full sm:max-w-lg flex flex-col p-0"
        >
          {/* Header - Fixed */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {hasItems && (
                    <Badge
                      className="absolute -top-2 -end-2 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                      variant="destructive"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </div>
                <div>
                  <div className="text-lg font-semibold">{t('cart.title')}</div>
                  {hasItems && (
                    <div className="text-sm font-normal text-muted-foreground">
                      {t('cart.itemCount', { count: cart?.length || 0 })}
                    </div>
                  )}
                </div>
              </div>
            </SheetTitle>
          </SheetHeader>

          {/* Content - Scrollable */}
          {!hasItems ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
                <Package className="relative h-24 w-24 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t('cart.emptyTitle')}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                {t('cart.emptyDescription')}
              </p>
              <Button asChild size="lg" className="min-w-[200px]">
                <Link
                  to="/marketplace"
                  search={{ page: 1 }}
                  onClick={() => onOpenChange(false)}
                >
                  {t('cart.startShopping')}
                  <ArrowRight
                    className={cn(
                      'h-4 w-4',
                      dir === 'rtl' ? 'me-2 rotate-180' : 'ms-2',
                    )}
                  />
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 px-6 py-4">
                <div className="space-y-3">
                  {cart?.map((item, index) => (
                    <div
                      key={item.id}
                      className="animate-in fade-in slide-in-from-top-2"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <CartItem item={item} />
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer - Fixed */}
              <div className="border-t bg-background">
                <div className="px-6 py-4 space-y-4">
                  {/* Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{t('cart.subtotal')}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('cart.total')}</span>
                      <span className="text-primary">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      asChild
                      size="lg"
                      className="w-full"
                      onClick={handleCheckout}
                    >
                      <Link to="/checkout">
                        {t('cart.checkout')}
                        <ArrowRight
                          className={cn(
                            'h-4 w-4',
                            dir === 'rtl' ? 'me-2 rotate-180' : 'ms-2',
                          )}
                        />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearDialog(true)}
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 me-2" />
                      {t('cart.clearAll')}
                    </Button>
                  </div>

                  {/* Info note */}
                  <p className="text-xs text-center text-muted-foreground">
                    {t('cart.checkoutNote')}
                  </p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Clear Cart Confirmation */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent dir={dir}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cart.clearConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cart.clearConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('cart.clearAll')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
