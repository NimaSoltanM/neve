// features/cart/components/cart-drawer.tsx (ENHANCED)

import { useEffect, useState } from 'react'
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
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { formatPrice } from '@/lib/utils'
import { CartItem } from './cart-item'
import { useAtom } from 'jotai'
import { highlightStateAtom } from '@/features/shared/highlight/atoms/highlight.atoms'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { t, dir } = useI18n()
  const { cart, total, hasItems, clearCart, isLoading } = useCart()
  const location = useLocation()
  const navigate = useNavigate()
  const [highlightState, setHighlightState] = useAtom(highlightStateAtom)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(
    null,
  )

  // Check URL params for cart highlight intent
  useEffect(() => {
    const params = new URLSearchParams(location.search as any)
    const shouldOpenCart = params.get('cart') === 'open'
    const itemToHighlight = params.get('highlightItem')

    if (shouldOpenCart) {
      onOpenChange(true)

      if (itemToHighlight) {
        setHighlightedItemId(itemToHighlight)

        // Trigger highlight state machine if it's waiting
        if (
          highlightState.status === 'highlighting' &&
          highlightState.intent.type === 'cart' &&
          highlightState.intent.itemId === itemToHighlight
        ) {
          // State machine already set, just let it run
        } else {
          // Manual trigger for direct URL access
          setHighlightState({
            status: 'highlighting',
            intent: { type: 'cart', itemId: itemToHighlight },
            elementId: `cart-item-${itemToHighlight}`,
          })
        }

        // Clean up URL after opening
        setTimeout(() => {
          params.delete('cart')
          params.delete('highlightItem')
          const newSearch = params.toString()
          navigate({
            to: '.',
            search: newSearch ? Object.fromEntries(params) : undefined,
            replace: true,
          } as any)
        }, 100)
      }
    }
  }, [
    location.search,
    onOpenChange,
    highlightState,
    setHighlightState,
    navigate,
  ])

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (open && highlightedItemId) {
      setTimeout(() => {
        const element = document.getElementById(
          `cart-item-${highlightedItemId}`,
        )
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 300) // Wait for drawer animation
    }
  }, [open, highlightedItemId])

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
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('cart.empty')}</p>
            <Button asChild>
              <Link to="/marketplace" search={{ page: 1 }}>
                {t('cart.continueShopping')}
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 mt-4 pr-4 max-h-[calc(100vh-280px)]">
              <div className="space-y-4">
                {/* FIX: cart is already an array, not an object with items */}
                {cart?.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    isHighlighted={highlightedItemId === String(item.productId)}
                    onHighlightEnd={() => {
                      if (highlightedItemId === String(item.productId)) {
                        setHighlightedItemId(null)
                      }
                    }}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="mt-6 space-y-4">
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{t('cart.total')}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <SheetFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => clearCart()}
                  className="w-full sm:w-auto"
                >
                  {t('cart.clear')}
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/checkout">
                    {t('cart.checkout')}
                    <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
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
