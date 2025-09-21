import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const processPaymentSchema = z.object({
  orderId: z.number(),
})

export const processPayment = createServerFn()
  .middleware([authMiddleware])
  .validator(processPaymentSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { orderId } = data

    // Get order to verify ownership and status
    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
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

    return {
      success: true,
      order: updatedOrder,
      message: 'Payment successful', // In real: include gateway reference
    }
  })
