import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { products } from '@/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { z } from 'zod'
import { createNotification } from '@/features/notifications/actions/create-notification.action'

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
        items: {
          with: {
            shop: true,
          },
        },
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

    // Send notifications after successful cancellation
    try {
      // Notify buyer about cancellation
      await createNotification({
        data: {
          userId: userId,
          type: 'order.cancelled',
          title: 'Order cancelled',
          message: `Your order #${orderId} has been cancelled. Total refund: $${order.totalAmount}`,
          priority: 'normal',
          actionUrl: `/dashboard/orders/${orderId}`,
          metadata: {
            orderId: orderId,
            totalAmount: order.totalAmount,
          },
        },
      })

      // Notify each shop owner about cancelled items
      const shopNotifications = new Map<
        number,
        {
          shopId: number
          shopUserId: string
          itemCount: number
          totalValue: number
        }
      >()

      for (const item of order.items) {
        if (item.shop) {
          const existing = shopNotifications.get(item.shopId) || {
            shopId: item.shopId,
            shopUserId: item.shop.userId,
            itemCount: 0,
            totalValue: 0,
          }
          existing.itemCount += item.quantity
          existing.totalValue += parseFloat(item.totalPrice)
          shopNotifications.set(item.shopId, existing)
        }
      }

      // Send notification to each affected shop owner
      for (const [shopId, data] of shopNotifications) {
        await createNotification({
          data: {
            userId: data.shopUserId,
            type: 'shop.order_cancelled',
            title: 'Order cancelled by customer',
            message: `Customer cancelled order #${orderId} containing ${data.itemCount} item(s) worth $${data.totalValue.toFixed(2)}`,
            priority: 'normal',
            actionUrl: `/shop/orders/${orderId}`,
            metadata: {
              orderId: orderId,
              shopId: shopId,
              itemCount: data.itemCount,
              totalValue: data.totalValue,
            },
          },
        })
      }
    } catch (notifError) {
      console.error('Failed to send cancellation notifications:', notifError)
    }

    return {
      success: true,
      message: 'Order cancelled successfully',
    }
  })
