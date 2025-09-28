import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { eq, and, desc } from 'drizzle-orm'
import { carts, products } from '@/server/db/schema'

export const getWonAuctions = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const wonAuctions = await db.query.products.findMany({
        where: and(
          eq(products.winnerId, context.user.id),
          eq(products.auctionStatus, 'ended'),
        ),
        columns: {
          id: true,
          name: true,
          slug: true,
          images: true,
          currentBid: true,
          endedAt: true,
          paymentDeadline: true,
        },
        with: {
          shop: {
            columns: {
              name: true,
            },
          },
        },
        orderBy: desc(products.endedAt),
      })

      // Check if items are in cart
      const userCart = await db.query.carts.findFirst({
        where: and(
          eq(carts.userId, context.user.id),
          eq(carts.status, 'active'),
        ),
        with: {
          items: {
            columns: {
              productId: true,
            },
          },
        },
      })

      const cartProductIds = new Set(
        userCart?.items.map((item) => item.productId) || [],
      )

      const data = wonAuctions.map((auction) => ({
        id: auction.id,
        name: auction.name,
        slug: auction.slug,
        image: auction.images?.[0] || null,
        winningBid: auction.currentBid,
        shopName: auction.shop?.name,
        endedAt: auction.endedAt,
        paymentDeadline: auction.paymentDeadline,
        hoursLeft: auction.paymentDeadline
          ? Math.max(
              0,
              Math.floor(
                (auction.paymentDeadline.getTime() - Date.now()) /
                  (1000 * 60 * 60),
              ),
            )
          : 0,
        inCart: cartProductIds.has(auction.id),
        isOverdue: auction.paymentDeadline
          ? auction.paymentDeadline < new Date()
          : false,
      }))

      return {
        success: true,
        data: {
          pending: data.filter((a) => !a.isOverdue && a.hoursLeft > 0),
          overdue: data.filter((a) => a.isOverdue),
        },
      }
    } catch (error) {
      console.error('Failed to get won auctions:', error)
      return {
        success: false,
        error: 'Failed to load won auctions',
      }
    }
  })
