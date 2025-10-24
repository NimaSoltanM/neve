import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { orderItems } from '../schemas/order-item.schema'
import { shops } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { createNotification } from '@/features/notifications/actions/create-notification.action'

const updateOrderStatusSchema = z.object({
  orderId: z.number(),
  status: z.enum(['paid', 'completed', 'cancelled']),
})

export const updateOrderStatus = createServerFn()
  .middleware([authMiddleware])
  .validator(updateOrderStatusSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { orderId, status } = data

    // Get user's shop
    const shop = await db.query.shops.findFirst({
      where: eq(shops.userId, userId),
    })

    if (!shop) {
      return {
        success: false,
        errorKey: 'errors.shopNotFound',
      }
    }

    // Verify this order has items from this shop
    const orderItemsInShop = await db.query.orderItems.findFirst({
      where: and(
        eq(orderItems.orderId, orderId),
        eq(orderItems.shopId, shop.id),
      ),
    })

    if (!orderItemsInShop) {
      return {
        success: false,
        errorKey: 'errors.orderNotFoundOrNotYours',
      }
    }

    // Get full order with user details for notification
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          where: eq(orderItems.shopId, shop.id),
        },
      },
    })

    if (!order) {
      return {
        success: false,
        errorKey: 'errors.orderNotFound',
      }
    }

    // Validate status transitions
    if (status === 'completed' && order.status !== 'paid') {
      return {
        success: false,
        errorKey: 'errors.onlyPaidOrdersCanBeCompleted',
      }
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning()

    // Send notification to customer
    try {
      let notificationTitle = ''
      let notificationMessage = ''

      if (status === 'completed') {
        notificationTitle = 'Order shipped!'
        notificationMessage = `Your order #${orderId} from ${shop.name} has been shipped and is on its way.`
      } else if (status === 'cancelled') {
        notificationTitle = 'Order cancelled'
        notificationMessage = `Your order #${orderId} from ${shop.name} has been cancelled by the seller.`
      }

      if (notificationTitle) {
        await createNotification({
          data: {
            userId: order.userId,
            type: `order.${status}`,
            title: notificationTitle,
            message: notificationMessage,
            priority: status === 'completed' ? 'normal' : 'high',
            actionUrl: `/dashboard/orders/${orderId}`,
            metadata: {
              orderId,
              shopId: shop.id,
              shopName: shop.name,
            },
          },
        })
      }
    } catch (notifError) {
      console.error('Failed to send order status notification:', notifError)
    }

    return {
      success: true,
      order: updatedOrder,
    }
  })
