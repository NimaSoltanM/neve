import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { bids } from '../schema'
import { eq, desc } from 'drizzle-orm'

export const getActiveBids = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const now = new Date()

      // Get all user's bids on active auctions
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
              auctionStatus: true,
              bidIncrement: true,
            },
          },
        },
        orderBy: desc(bids.createdAt),
      })

      // Filter for active auctions and group by product
      const activeBidsMap = new Map()

      for (const bid of userBids) {
        if (
          bid.product.auctionStatus === 'active' &&
          bid.product.auctionEndsAt &&
          bid.product.auctionEndsAt > now
        ) {
          const existing = activeBidsMap.get(bid.productId)
          if (!existing || bid.createdAt > existing.createdAt) {
            activeBidsMap.set(bid.productId, bid)
          }
        }
      }

      const activeBids = Array.from(activeBidsMap.values()).map((bid) => ({
        id: bid.id,
        productId: bid.product.id,
        productName: bid.product.name,
        productSlug: bid.product.slug,
        productImage: bid.product.images?.[0] || null,
        myBid: bid.amount,
        currentBid: bid.product.currentBid,
        minNextBid:
          parseFloat(bid.product.currentBid || '0') +
          parseFloat(bid.product.bidIncrement || '1'),
        isWinning: bid.isWinning,
        endsAt: bid.product.auctionEndsAt,
        timeLeft: bid.product.auctionEndsAt
          ? Math.max(0, bid.product.auctionEndsAt.getTime() - now.getTime())
          : 0,
      }))

      return {
        success: true,
        data: activeBids.sort((a, b) => a.timeLeft - b.timeLeft), // Sort by ending soon
      }
    } catch (error) {
      console.error('Failed to get active bids:', error)
      return {
        success: false,
        error: 'Failed to load active bids',
      }
    }
  })
