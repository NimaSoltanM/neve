import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { shops, products, orders, orderItems, users } from '@/server/db/schema'
import { eq, and, desc, gte, sql, inArray, count } from 'drizzle-orm'

export const getShopDashboardStats = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id

    const shop = await db.query.shops.findFirst({
      where: eq(shops.userId, userId),
    })

    if (!shop) {
      return {
        success: false,
        error: 'Shop not found',
      }
    }

    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const paidStatuses = ['paid', 'completed'] as const

    const [todaySales] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, todayStart),
        ),
      )

    const [weekSales] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, weekStart),
        ),
      )

    const [monthSales] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, monthStart),
        ),
      )

    const [totalRevenue] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
        ),
      )

    const [productsCount] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.shopId, shop.id))

    const [auctionsCount] = await db
      .select({ count: count() })
      .from(products)
      .where(
        and(
          eq(products.shopId, shop.id),
          eq(products.type, 'auction'),
          eq(products.auctionStatus, 'active'),
        ),
      )

    const pendingCount = await db
      .selectDistinct({ orderId: orders.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orderItems.shopId, shop.id), eq(orders.status, 'pending')))

    const recentOrders = await db
      .selectDistinct({
        orderId: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        userId: orders.userId,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orderItems.shopId, shop.id))
      .orderBy(desc(orders.createdAt))
      .limit(5)

    const ordersWithDetails = await Promise.all(
      recentOrders.map(async (order) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, order.userId),
        })

        const [itemsCount] = await db
          .select({ count: count() })
          .from(orderItems)
          .where(
            and(
              eq(orderItems.orderId, order.orderId),
              eq(orderItems.shopId, shop.id),
            ),
          )

        return {
          id: order.orderId.toString(),
          customerName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
          customerPhone: user?.phoneNumber || '',
          itemsCount: itemsCount.count,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        }
      }),
    )

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const topProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        image: sql<string>`(${products.images}->0)::text`,
        sales: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
        stock: products.stock,
        revenue: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
      })
      .from(products)
      .leftJoin(orderItems, eq(products.id, orderItems.productId))
      .leftJoin(
        orders,
        and(
          eq(orderItems.orderId, orders.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, thirtyDaysAgo),
        ),
      )
      .where(eq(products.shopId, shop.id))
      .groupBy(
        products.id,
        products.name,
        products.slug,
        products.images,
        products.stock,
      )
      .orderBy(
        desc(sql`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)`),
      )
      .limit(5)

    const lowStock = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        image: sql<string>`(${products.images}->0)::text`,
        stock: products.stock,
      })
      .from(products)
      .where(
        and(
          eq(products.shopId, shop.id),
          sql`${products.stock} < 10 AND ${products.stock} > 0`,
        ),
      )
      .orderBy(products.stock)
      .limit(5)

    return {
      success: true,
      data: {
        stats: {
          todaySales: todaySales?.total || '0',
          weekSales: weekSales?.total || '0',
          monthSales: monthSales?.total || '0',
          totalRevenue: totalRevenue?.total || '0',
          totalProducts: productsCount.count,
          activeAuctions: auctionsCount.count,
          pendingOrders: pendingCount.length,
        },
        recentOrders: ordersWithDetails,
        topProducts: topProducts.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          slug: p.slug,
          image: p.image?.replace(/"/g, '') || null,
          sales: p.sales,
          views: 0,
          stock: p.stock || 0,
          revenue: p.revenue,
        })),
        lowStockProducts: lowStock.map((p) => ({
          id: p.id.toString(),
          name: p.name,
          slug: p.slug,
          image: p.image?.replace(/"/g, '') || null,
          stock: p.stock || 0,
          threshold: 10,
        })),
      },
    }
  })
