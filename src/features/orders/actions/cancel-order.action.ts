import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { products } from '@/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'

const cancelOrderSchema = z.object({
  orderId: z.number(),
})

export const cancelOrder = createServerFn()
  .middleware([authMiddleware])
  .validator(cancelOrderSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { orderId } = data

    // Get order with items
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
      with: {
        items: true,
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be cancelled')
    }

    // Cancel order and restore stock in transaction
    await db.transaction(async (tx) => {
      // Update order status
      await tx
        .update(orders)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))

      // Restore stock for regular products
      for (const item of order.items) {
        const product = await tx.query.products.findFirst({
          where: eq(products.id, item.productId),
        })

        if (product?.type === 'regular' && product.stock !== null) {
          await tx
            .update(products)
            .set({
              stock: sql`${products.stock} + ${item.quantity}`,
            })
            .where(eq(products.id, item.productId))
        }
      }
    })

    return {
      success: true,
      message: 'Order cancelled successfully',
    }
  })
