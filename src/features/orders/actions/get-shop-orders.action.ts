import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '../schemas/order.schema'
import { orderItems } from '../schemas/order-item.schema'
import { shops } from '@/server/db/schema'
import { eq, and, desc, sql, countDistinct } from 'drizzle-orm'
import { z } from 'zod'

const getShopOrdersSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  status: z.enum(['pending', 'paid', 'completed', 'cancelled']).optional(),
})

export const getShopOrders = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(getShopOrdersSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { page, limit, status } = data

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

    // Build where conditions
    const conditions = [eq(orderItems.shopId, shop.id)]
    if (status) {
      conditions.push(eq(orders.status, status))
    }

    // Get total count of DISTINCT orders
    const [totalResult] = await db
      .select({ count: countDistinct(orders.id) })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(...conditions))

    const total = Number(totalResult.count)

    // Get orders using selectDistinct pattern like shop-stats
    const ordersData = await db
      .selectDistinct({
        orderId: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        paidAt: orders.paidAt,
        userId: orders.userId,
        shippingAddress: orders.shippingAddress,
        paymentMethod: orders.paymentMethod,
        updatedAt: orders.updatedAt,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    if (ordersData.length === 0) {
      return {
        success: true,
        orders: [],
        pagination: {
          page,
          limit,
          total,
          totalPages: 0,
        },
      }
    }

    // Get full order details with items and user info
    const ordersWithDetails = await Promise.all(
      ordersData.map(async (order) => {
        const user = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, order.userId),
          columns: {
            id: true,
            firstName: true,
            lastName: true,
            phoneNumber: true,
          },
        })

        const items = await db.query.orderItems.findMany({
          where: and(
            eq(orderItems.orderId, order.orderId),
            eq(orderItems.shopId, shop.id),
          ),
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                images: true,
                type: true,
              },
            },
          },
        })

        return {
          id: order.orderId,
          userId: order.userId,
          shippingAddress: order.shippingAddress,
          totalAmount: order.totalAmount,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paidAt: order.paidAt,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          user,
          items,
        }
      }),
    )

    return {
      success: true,
      orders: ordersWithDetails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  })
