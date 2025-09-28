import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { createNotification } from '@/features/notifications/actions/create-notification.action'

const processPaymentSchema = z.object({
  orderId: z.number(),
})

export const processPayment = createServerFn()
  .middleware([authMiddleware])
  .validator(processPaymentSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { orderId } = data

    // Get order with items to notify shop owners
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
      throw new Error('Order cannot be paid')
    }

    // Mock payment processing delay (remove when real payment is integrated)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock payment success (replace with real payment verification)
    const mockPaymentSuccessful = true // In real: verify with payment gateway

    if (!mockPaymentSuccessful) {
      throw new Error('Payment failed')
    }

    // Update order status
    const [updatedOrder] = await db
      .update(orders)
      .set({
        status: 'paid',
        paidAt: new Date(),
        paymentMethod: 'mock', // In real: 'zarinpal', 'idpay', etc
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning()

    // Send notifications after successful payment
    try {
      // Notify buyer about payment success
      await createNotification({
        data: {
          userId: userId,
          type: 'order.paid',
          title: 'Payment successful!',
          message: `Your payment for order #${orderId} has been confirmed. Total paid: $${updatedOrder.totalAmount}`,
          priority: 'normal',
          actionUrl: `/dashboard/orders/${orderId}`,
          metadata: {
            orderId: orderId,
            totalAmount: updatedOrder.totalAmount,
            paymentMethod: updatedOrder.paymentMethod,
          },
        },
      })

      // Group items by shop for notifications
      const shopPayments = new Map<
        number,
        { shopUserId: string; totalValue: number; itemCount: number }
      >()

      for (const item of order.items) {
        if (item.shop) {
          const existing = shopPayments.get(item.shopId) || {
            shopUserId: item.shop.userId,
            totalValue: 0,
            itemCount: 0,
          }
          existing.totalValue += parseFloat(item.totalPrice)
          existing.itemCount += item.quantity
          shopPayments.set(item.shopId, existing)
        }
      }

      // Notify each shop owner about payment received
      for (const [shopId, data] of shopPayments) {
        await createNotification({
          data: {
            userId: data.shopUserId,
            type: 'shop.payment_received',
            title: 'Payment received!',
            message: `Payment confirmed for order #${orderId}. ${data.itemCount} item(s) worth $${data.totalValue.toFixed(2)}. You can now ship the items.`,
            priority: 'urgent',
            actionUrl: `/shop/orders/${orderId}`,
            metadata: {
              orderId: orderId,
              shopId: shopId,
              totalValue: data.totalValue,
              itemCount: data.itemCount,
            },
          },
        })
      }
    } catch (notifError) {
      console.error('Failed to send payment notifications:', notifError)
    }

    return {
      success: true,
      order: updatedOrder,
      message: 'Payment successful', // In real: include gateway reference
    }
  })
