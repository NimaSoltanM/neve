import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useI18n } from '@/features/shared/i18n'
import { useCreateOrder } from '../hooks/use-orders'
import { useCart } from '@/features/cart/hooks/use-cart'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, ShoppingBag, Package } from 'lucide-react'
import type { ShippingAddress } from '../types/order.types'

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phoneNumber: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(10, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().regex(/^\d{10}$/, 'Postal code must be 10 digits'),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

interface CheckoutFormProps {
  onSuccess?: (orderId: number) => void
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const { t, dir } = useI18n()
  const { cart, total, itemCount } = useCart()
  const createOrder = useCreateOrder()

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      address: '',
      city: '',
      postalCode: '',
    },
  })

  const handleSubmit = async (data: CheckoutFormData) => {
    const shippingAddress: ShippingAddress = data

    const result = await createOrder.mutateAsync({
      shippingAddress,
    })

    if (result.success && onSuccess) {
      onSuccess(result.orderId)
    }
  }

  if (!cart || itemCount === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('cart.empty')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div dir={dir} className="space-y-6">
      {/* Enhanced Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orders.orderSummary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cart Items */}
          {cart.map((item) => (
            <div key={`${item.product.id}`} className="space-y-3">
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="h-16 w-16 flex-shrink-0">
                  {item.product.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted rounded-md flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">
                    {item.product.name}
                  </h4>

                  {item.product.type === 'auction' ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {t('products.auction')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t('cart.bidAmount')}:
                        <span className="font-medium ms-1" dir="ltr">
                          ${item.bidAmount || item.product.currentBid}
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {t('cart.quantity')}: {item.quantity}
                      </span>
                      <span className="text-xs text-muted-foreground">×</span>
                      <span className="text-xs font-medium" dir="ltr">
                        ${item.priceAtAdd}
                      </span>
                    </div>
                  )}
                </div>

                {/* Item Total */}
                <div className="text-end">
                  <p className="text-sm font-semibold" dir="ltr">
                    $
                    {(item.product.type === 'auction'
                      ? parseFloat(
                          item.bidAmount || item.product.currentBid || '0',
                        )
                      : parseFloat(item.priceAtAdd) * item.quantity
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
              <Separator />
            </div>
          ))}

          {/* Summary Totals */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('orders.subtotal')}
              </span>
              <span dir="ltr">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {t('orders.shipping')}
              </span>
              <span className="text-muted-foreground">{t('orders.free')}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold text-lg pt-1">
              <span>{t('orders.total')}</span>
              <span dir="ltr">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orders.shippingAddress')}</CardTitle>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orders.fullName')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('orders.fullNamePlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orders.phoneNumber')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        dir="ltr"
                        placeholder="+98 912 345 6789"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('orders.address')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('orders.addressPlaceholder')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('orders.city')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('orders.cityPlaceholder')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('orders.postalCode')}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" placeholder="1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full"
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <>
                    <Loader2 className="ms-2 h-4 w-4 animate-spin" />
                    {t('orders.placingOrder')}
                  </>
                ) : (
                  t('orders.placeOrder')
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
