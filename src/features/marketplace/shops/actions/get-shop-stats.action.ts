import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { products } from '@/features/marketplace/products/schema'
import { orderItems } from '@/features/orders/schemas/order-item.schema'
import { orders } from '@/features/orders/schemas/order.schema'
import { shops } from '../schema'
import { eq, desc, sql, and, gte } from 'drizzle-orm'

export const getShopStats = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id

    // Get user's shop
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.userId, userId))
      .limit(1)

    if (!shop) {
      throw new Error('Shop not found')
    }

    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const weekStart = new Date(now.setDate(now.getDate() - 7))
    const monthStart = new Date(now.setMonth(now.getMonth() - 1))

    // Get today's sales
    const [todaySales] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), '0')`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          eq(orders.status, 'paid'),
          gte(orders.paidAt, todayStart),
        ),
      )

    // Get this week's sales
    const [weekSales] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), '0')`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          eq(orders.status, 'paid'),
          gte(orders.paidAt, weekStart),
        ),
      )

    // Get this month's sales
    const [monthSales] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), '0')`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          eq(orders.status, 'paid'),
          gte(orders.paidAt, monthStart),
        ),
      )

    // Get total revenue (all time)
    const [totalRevenue] = await db
      .select({
        total: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), '0')`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orderItems.shopId, shop.id), eq(orders.status, 'paid')))

    // Get total products count
    const [totalProducts] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(eq(products.shopId, shop.id), eq(products.isActive, true)))

    // Get active auctions count
    const [activeAuctions] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(
        and(
          eq(products.shopId, shop.id),
          eq(products.type, 'auction'),
          eq(products.auctionStatus, 'active'),
          eq(products.isActive, true),
        ),
      )

    // Get pending orders count (orders not yet paid)
    const [pendingOrders] = await db
      .select({ count: sql<number>`count(DISTINCT ${orders.id})::int` })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(and(eq(orderItems.shopId, shop.id), eq(orders.status, 'pending')))

    // Get recent orders (last 5)
    const recentOrdersData = await db
      .selectDistinct({
        orderId: orders.id,
        status: orders.status,
        totalAmount: orders.totalAmount,
        createdAt: orders.createdAt,
        paidAt: orders.paidAt,
        userId: orders.userId,
      })
      .from(orders)
      .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
      .where(eq(orderItems.shopId, shop.id))
      .orderBy(desc(orders.createdAt))
      .limit(5)

    // Get order items for each recent order
    const recentOrders = await Promise.all(
      recentOrdersData.map(async (order) => {
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
              },
            },
          },
        })

        return {
          id: order.orderId,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
          paidAt: order.paidAt,
          userId: order.userId,
          items,
        }
      }),
    )

    // Get top performing products (by sales count and revenue)
    const topProducts = await db
      .select({
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        productImages: products.images,
        sales: sql<number>`count(${orderItems.id})::int`,
        revenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), '0')`,
      })
      .from(products)
      .leftJoin(
        orderItems,
        and(
          eq(products.id, orderItems.productId),
          eq(orderItems.shopId, shop.id),
        ),
      )
      .leftJoin(
        orders,
        and(eq(orderItems.orderId, orders.id), eq(orders.status, 'paid')),
      )
      .where(and(eq(products.shopId, shop.id), eq(products.isActive, true)))
      .groupBy(products.id, products.name, products.slug, products.images)
      .orderBy(desc(sql`count(${orderItems.id})`))
      .limit(5)

    // Get low stock products (stock < 10 for regular products)
    const lowStockProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        images: products.images,
        stock: products.stock,
      })
      .from(products)
      .where(
        and(
          eq(products.shopId, shop.id),
          eq(products.type, 'regular'),
          eq(products.isActive, true),
          sql`${products.stock} < 10 AND ${products.stock} >= 0`,
        ),
      )
      .orderBy(products.stock)
      .limit(5)

    return {
      shop,
      stats: {
        todaySales: todaySales.total,
        weekSales: weekSales.total,
        monthSales: monthSales.total,
        totalRevenue: totalRevenue.total,
        totalProducts: totalProducts.count,
        activeAuctions: activeAuctions.count,
        pendingOrders: pendingOrders.count,
      },
      recentOrders,
      topProducts,
      lowStockProducts,
    }
  })
