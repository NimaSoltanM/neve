import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { orders } from '@/features/orders/schemas/order.schema'
import { bids } from '@/features/marketplace/bids/schema'
import { products } from '@/features/marketplace/products/schema'
import { eq, desc, and, gt, sql } from 'drizzle-orm'

export const getDashboardStats = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id
    const now = new Date()

    // Get total orders count
    const [totalOrdersResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.userId, userId))

    // Get pending payments count (orders that are not paid yet)
    const [pendingPaymentsResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(and(eq(orders.userId, userId), eq(orders.status, 'pending')))

    // Get active bids count - need to join with products to check auction end time
    const activeBidsData = await db
      .select({ bidId: bids.id })
      .from(bids)
      .innerJoin(products, eq(bids.productId, products.id))
      .where(
        and(
          eq(bids.userId, userId),
          eq(products.type, 'auction'),
          gt(products.auctionEndsAt, now),
        ),
      )

    // Get recent orders (last 5)
    const recentOrders = await db.query.orders.findMany({
      where: eq(orders.userId, userId),
      orderBy: [desc(orders.createdAt)],
      limit: 5,
      with: {
        items: {
          limit: 1, // Just get first item for display
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
        },
      },
    })

    // Get active bids with product details
    const activeBids = await db.query.bids.findMany({
      where: eq(bids.userId, userId),
      orderBy: [desc(bids.createdAt)],
      limit: 5,
      with: {
        product: {
          columns: {
            id: true,
            name: true,
            slug: true,
            images: true,
            type: true,
            auctionEndsAt: true,
            currentBid: true,
          },
        },
      },
    })

    // Filter only active auctions (end time in future)
    const activeAuctionBids = activeBids.filter(
      (bid) =>
        bid.product &&
        bid.product.type === 'auction' &&
        bid.product.auctionEndsAt &&
        new Date(bid.product.auctionEndsAt) > now,
    )

    return {
      stats: {
        totalOrders: totalOrdersResult.count,
        activeBids: activeBidsData.length,
        pendingPayments: pendingPaymentsResult.count,
      },
      recentOrders,
      activeBids: activeAuctionBids,
    }
  })
