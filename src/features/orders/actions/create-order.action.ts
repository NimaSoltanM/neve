import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { carts, cartItems } from '@/features/cart/schemas/cart.schema'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { orderItems } from '../schemas/order-item.schema'
import { products } from '@/server/db/schema'

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

    return {
      success: true,
      orderId: newOrder.id,
      totalAmount: newOrder.totalAmount,
    }
  })
