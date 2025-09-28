// src/features/bids/actions/get-lost-auctions.action.ts

import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { bids } from '../schema'
import { eq, and, ne, desc, gte } from 'drizzle-orm'
import { products } from '@/server/db/schema'

export const getLostAuctions = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // First get all ended auctions where user bid but didn't win
      const lostAuctionProducts = await db.query.products.findMany({
        where: and(
          eq(products.auctionStatus, 'ended'),
          ne(products.winnerId, context.user.id),
          gte(products.endedAt, sevenDaysAgo),
        ),
        with: {
          winner: {
            columns: {
              firstName: true,
            },
          },
          bids: {
            where: eq(bids.userId, context.user.id),
            orderBy: desc(bids.amount),
            limit: 1,
          },
        },
        orderBy: desc(products.endedAt),
      })

      // Filter to only auctions where the user actually bid
      const lostAuctions = lostAuctionProducts
        .filter((product) => product.bids.length > 0)
        .slice(0, 20)
        .map((auction) => ({
          productId: auction.id,
          productName: auction.name,
          productSlug: auction.slug,
          productImage: auction.images?.[0] || null,
          finalPrice: auction.currentBid || '0',
          myHighestBid: auction.bids[0]?.amount || '0',
          outbidBy:
            parseFloat(auction.currentBid || '0') -
            parseFloat(auction.bids[0]?.amount || '0'),
          endedAt: auction.endedAt,
          winnerName: auction.winner?.firstName || 'Anonymous',
        }))

      return {
        success: true,
        data: lostAuctions,
      }
    } catch (error) {
      console.error('Failed to get lost auctions:', error)
      return {
        success: false,
        error: 'Failed to load lost auctions',
      }
    }
  })
