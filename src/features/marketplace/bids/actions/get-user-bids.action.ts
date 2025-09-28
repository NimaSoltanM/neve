import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { eq, desc } from 'drizzle-orm'
import { bids } from '../schema'

// Get user's active bids
export const getUserBids = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const userBids = await db.query.bids.findMany({
        where: eq(bids.userId, context.user.id),
        with: {
          product: {
            columns: {
              id: true,
              name: true,
              slug: true,
              images: true,
              auctionEndsAt: true,
              currentBid: true,
            },
          },
        },
        orderBy: desc(bids.createdAt),
      })

      // Group by product and only show latest bid per product
      const latestBids = Object.values(
        userBids.reduce(
          (acc, bid) => {
            if (
              !acc[bid.productId] ||
              acc[bid.productId].createdAt < bid.createdAt
            ) {
              acc[bid.productId] = bid
            }
            return acc
          },
          {} as Record<number, (typeof userBids)[0]>,
        ),
      )

      return {
        success: true,
        data: latestBids.map((bid) => ({
          ...bid,
          status: bid.isWinning ? 'winning' : 'outbid',
          timeLeft: bid.product.auctionEndsAt
            ? Math.max(
                0,
                new Date(bid.product.auctionEndsAt).getTime() - Date.now(),
              )
            : 0,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load your bids',
      }
    }
  })
