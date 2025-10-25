import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '@/features/orders/schemas/order.schema'
import { orderItems } from '@/features/orders/schemas/order-item.schema'
import { products } from '@/features/marketplace/products/schema'
import { shops } from '@/features/marketplace/shops/schema'
import { eq, and, gte, lte, sql, desc, inArray } from 'drizzle-orm'
import { z } from 'zod'
import type {
  AnalyticsDashboardData,
  AnalyticsOverview,
  RevenueDataPoint,
  TopProduct,
} from '../types/analytics.types'

const analyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  from: z.string().optional(),
  to: z.string().optional(),
})

export const getAnalyticsData = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(analyticsSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { period, from, to } = data

    const shop = await db.query.shops.findFirst({
      where: eq(shops.userId, userId),
    })

    if (!shop) {
      return {
        success: false,
        errorKey: 'errors.shopNotFound',
      }
    }

    const now = new Date()
    let startDate: Date
    let previousStartDate: Date

    if (from && to) {
      startDate = new Date(from)
      const endDate = new Date(to)
      const rangeDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      )
      previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - rangeDays)
    } else {
      const periodDays = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365,
      }[period]

      startDate = new Date(now)
      startDate.setDate(startDate.getDate() - periodDays)

      previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - periodDays)
    }

    // Include both 'paid' and 'completed' orders
    const paidStatuses = ['paid', 'completed'] as const

    const [currentMetrics] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, startDate),
        ),
      )

    const [previousMetrics] = await db
      .select({
        totalRevenue: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, previousStartDate),
          lte(orders.paidAt, startDate),
        ),
      )

    const currentRevenue = parseFloat(currentMetrics.totalRevenue)
    const previousRevenue = parseFloat(previousMetrics.totalRevenue)
    const currentOrders = currentMetrics.totalOrders
    const previousOrders = previousMetrics.totalOrders

    const revenueChange =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : currentRevenue > 0
          ? 100
          : 0

    const ordersChange =
      previousOrders > 0
        ? ((currentOrders - previousOrders) / previousOrders) * 100
        : currentOrders > 0
          ? 100
          : 0

    const avgOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0
    const previousAvgOrderValue =
      previousOrders > 0 ? previousRevenue / previousOrders : 0

    const aovChange =
      previousAvgOrderValue > 0
        ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) *
          100
        : avgOrderValue > 0
          ? 100
          : 0

    const overview: AnalyticsOverview = {
      totalRevenue: currentRevenue.toFixed(2),
      totalOrders: currentOrders,
      averageOrderValue: avgOrderValue.toFixed(2),
      revenueChange: Number(revenueChange.toFixed(1)),
      ordersChange: Number(ordersChange.toFixed(1)),
      aovChange: Number(aovChange.toFixed(1)),
    }

    const revenueTimeSeries = await db
      .select({
        date: sql<string>`DATE(${orders.paidAt})`,
        revenue: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.id})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, startDate),
        ),
      )
      .groupBy(sql`DATE(${orders.paidAt})`)
      .orderBy(sql`DATE(${orders.paidAt})`)

    const topProductsData = await db
      .select({
        productId: products.id,
        productName: products.name,
        productSlug: products.slug,
        productImage: sql<string>`(${products.images}->0)::text`,
        totalRevenue: sql<string>`COALESCE(SUM(CAST(${orderItems.totalPrice} AS NUMERIC)), 0)::text`,
        unitsSold: sql<number>`COALESCE(SUM(${orderItems.quantity}), 0)::int`,
        orderCount: sql<number>`COUNT(DISTINCT ${orders.id})::int`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(
        and(
          eq(orderItems.shopId, shop.id),
          inArray(orders.status, paidStatuses),
          gte(orders.paidAt, startDate),
        ),
      )
      .groupBy(products.id, products.name, products.slug, products.images)
      .orderBy(desc(sql`SUM(CAST(${orderItems.totalPrice} AS NUMERIC))`))
      .limit(10)

    const topProducts: TopProduct[] = topProductsData.map((p) => ({
      productId: p.productId,
      productName: p.productName,
      productSlug: p.productSlug,
      productImage: p.productImage?.replace(/"/g, ''),
      totalRevenue: p.totalRevenue,
      unitsSold: p.unitsSold,
      orderCount: p.orderCount,
    }))

    const result: AnalyticsDashboardData = {
      overview,
      revenueTimeSeries: revenueTimeSeries as RevenueDataPoint[],
      topProducts,
    }

    return {
      success: true,
      data: result,
    }
  })
