import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const getOrderDetailsSchema = z.object({
  orderId: z.number(),
})

export const getOrderDetails = createServerFn()
  .middleware([authMiddleware])
  .validator(getOrderDetailsSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { orderId } = data

    const order = await db.query.orders.findFirst({
      where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
      with: {
        items: {
          with: {
            product: true,
            shop: true,
          },
        },
      },
    })

    if (!order) {
      throw new Error('Order not found')
    }

    return order
  })
