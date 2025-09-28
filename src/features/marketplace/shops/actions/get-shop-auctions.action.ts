import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { shops } from '../schema'
import { products } from '@/features/marketplace/products/schema'
import { bids } from '@/features/marketplace/bids/schema'
import { eq, and, desc } from 'drizzle-orm'

export const getShopAuctions = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const shop = await db.query.shops.findFirst({
        where: eq(shops.userId, context.user.id),
      })

      if (!shop) {
        return { success: false, error: 'Shop not found' }
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const auctions = await db.query.products.findMany({
        where: and(eq(products.shopId, shop.id), eq(products.type, 'auction')),
        with: {
          bids: {
            orderBy: desc(bids.createdAt),
          },
          winner: {
            columns: {
              firstName: true,
              lastName: true,
              phoneNumber: true,
            },
          },
        },
        orderBy: desc(products.createdAt),
      })

      // Calculate stats
      const stats = {
        total: auctions.length,
        active: auctions.filter((a) => a.auctionStatus === 'active').length,
        sold: auctions.filter(
          (a) => a.winnerId && a.auctionStatus !== 'cancelled',
        ).length,
        revenue: auctions
          .filter((a) => a.auctionStatus === 'paid')
          .reduce((sum, a) => sum + parseFloat(a.currentBid || '0'), 0),
        recentBids: auctions
          .flatMap((a) => a.bids)
          .filter((b) => b.createdAt >= thirtyDaysAgo).length,
      }

      const active = auctions
        .filter((a) => a.auctionStatus === 'active')
        .map((a) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          image: a.images?.[0] || null,
          startingPrice: a.startingPrice,
          currentBid: a.currentBid,
          bidCount: a.bids.length,
          lastBid: a.bids[0]?.createdAt || null,
          endsAt: a.auctionEndsAt,
          timeLeft: a.auctionEndsAt
            ? Math.max(0, new Date(a.auctionEndsAt).getTime() - Date.now())
            : 0,
        }))

      const ended = auctions
        .filter((a) => a.auctionStatus !== 'active')
        .map((a) => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          image: a.images?.[0] || null,
          finalPrice: a.currentBid,
          winner: a.winner
            ? {
                name: `${a.winner.firstName} ${a.winner.lastName}`,
                phone: a.winner.phoneNumber,
              }
            : null,
          status: a.auctionStatus,
          endedAt: a.endedAt,
          paymentDeadline: a.paymentDeadline,
          isPastDeadline: a.paymentDeadline && new Date() > a.paymentDeadline,
        }))

      return {
        success: true,
        data: { active, ended, stats },
      }
    } catch (error) {
      return { success: false, error: 'Failed to load auctions' }
    }
  })
