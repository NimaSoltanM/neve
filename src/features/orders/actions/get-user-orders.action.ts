import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { eq, desc, sql } from 'drizzle-orm'
import { z } from 'zod'

const getUserOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
})

export const getUserOrders = createServerFn()
  .middleware([authMiddleware])
  .validator(getUserOrdersSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { page, limit } = data
    const offset = (page - 1) * limit

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.userId, userId))

    // Get orders with items
    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      limit,
      offset,
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
            shop: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    return {
      orders: userOrders,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    }
  })
