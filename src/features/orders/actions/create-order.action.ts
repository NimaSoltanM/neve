import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { carts, cartItems } from '@/features/cart/schemas/cart.schema'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { orderItems } from '../schemas/order-item.schema'
import { products } from '@/server/db/schema'
import { createNotification } from '@/features/notifications/actions/create-notification.action'

const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(1),
    phoneNumber: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    postalCode: z.string().min(1),
  }),
})

export const createOrder = createServerFn()
  .middleware([authMiddleware])
  .validator(createOrderSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id

    // Get user's active cart with items
    const userCart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, userId), eq(carts.status, 'active')),
      with: {
        items: {
          with: {
            product: {
              with: {
                shop: true,
              },
            },
          },
        },
      },
    })

    if (!userCart || userCart.items.length === 0) {
      throw new Error('Cart is empty')
    }

    // Calculate total and validate stock
    let totalAmount = 0
    const orderItemsData: Omit<typeof orderItems.$inferInsert, 'orderId'>[] = []
    const shopItemsMap = new Map<
      number,
      { shopUserId: string; items: any[]; totalValue: number }
    >()

    for (const item of userCart.items) {
      const product = item.product

      // Check stock for regular products
      if (product.type === 'regular' && product.stock !== null) {
        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`)
        }
      }

      const unitPrice =
        item.bidAmount || item.priceAtAdd || product.price || '0'
      const itemTotal = parseFloat(unitPrice) * item.quantity
      totalAmount += itemTotal

      orderItemsData.push({
        productId: product.id,
        shopId: product.shopId,
        quantity: item.quantity,
        unitPrice: unitPrice,
        totalPrice: itemTotal.toFixed(2),
        isAuctionWin: product.type === 'auction' ? 1 : 0,
        productSnapshot: {
          name: product.name,
          slug: product.slug,
          type: product.type,
          images: product.images as string[],
          price: product.price || undefined,
          bidAmount: item.bidAmount || undefined,
        },
      })

      // Group items by shop for notifications
      const shopData = shopItemsMap.get(product.shopId) || {
        shopUserId: product.shop.userId,
        items: [],
        totalValue: 0,
      }
      shopData.items.push({
        productName: product.name,
        quantity: item.quantity,
        price: unitPrice,
      })
      shopData.totalValue += itemTotal
      shopItemsMap.set(product.shopId, shopData)
    }

    // Create order in transaction
    const [newOrder] = await db.transaction(async (tx) => {
      // Create order
      const [order] = await tx
        .insert(orders)
        .values({
          userId,
          shippingAddress: data.shippingAddress,
          totalAmount: totalAmount.toFixed(2),
          status: 'pending',
        })
        .returning()

      // Create order items
      await tx.insert(orderItems).values(
        orderItemsData.map((item) => ({
          ...item,
          orderId: order.id,
        })),
      )

      // Reduce stock for regular products
      for (const item of userCart.items) {
        if (item.product.type === 'regular' && item.product.stock !== null) {
          await tx
            .update(products)
            .set({
              stock: sql`${products.stock} - ${item.quantity}`,
            })
            .where(eq(products.id, item.product.id))
        }
      }

      // Clear cart
      await tx.delete(cartItems).where(eq(cartItems.cartId, userCart.id))
      await tx
        .update(carts)
        .set({ status: 'converted' })
        .where(eq(carts.id, userCart.id))

      return [order]
    })

    // Send notifications after successful order creation
    try {
      // Notify buyer about order confirmation
      await createNotification({
        data: {
          userId: userId,
          type: 'order.placed',
          title: 'Order confirmed!',
          message: `Your order #${newOrder.id} has been placed successfully. Total: $${newOrder.totalAmount}`,
          priority: 'normal',
          actionUrl: `/dashboard/orders/${newOrder.id}`,
          metadata: {
            orderId: newOrder.id,
            totalAmount: newOrder.totalAmount,
            itemCount: orderItemsData.length,
          },
        },
      })

      // Notify each shop owner about new order
      for (const [shopId, data] of shopItemsMap) {
        await createNotification({
          data: {
            userId: data.shopUserId,
            type: 'shop.new_order',
            title: 'New order received!',
            message: `You have a new order #${newOrder.id} with ${data.items.length} item(s) worth $${data.totalValue.toFixed(2)}`,
            priority: 'high',
            actionUrl: `/shop/orders/${newOrder.id}`,
            metadata: {
              orderId: newOrder.id,
              shopId: shopId,
              items: data.items,
              totalValue: data.totalValue,
            },
          },
        })
      }
    } catch (notifError) {
      console.error('Failed to send order notifications:', notifError)
    }

    return {
      success: true,
      orderId: newOrder.id,
      totalAmount: newOrder.totalAmount,
    }
  })
