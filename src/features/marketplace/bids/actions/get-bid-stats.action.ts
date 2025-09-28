// src/features/bids/actions/get-bid-stats.action.ts

import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { bids } from '../schema'
import { eq, and, gte } from 'drizzle-orm'
import { products } from '@/server/db/schema'

export const getBidStats = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      // Get all user's bids from last 30 days
      const userBids = await db.query.bids.findMany({
        where: and(
          eq(bids.userId, context.user.id),
          gte(bids.createdAt, thirtyDaysAgo),
        ),
        with: {
          product: {
            columns: {
              id: true,
              auctionStatus: true,
              winnerId: true,
              currentBid: true,
            },
          },
        },
      })

      // Get won auctions that are paid
      const paidWonAuctions = await db.query.products.findMany({
        where: and(
          eq(products.winnerId, context.user.id),
          eq(products.auctionStatus, 'paid'),
        ),
        columns: {
          currentBid: true,
        },
      })

      // Calculate stats
      const uniqueAuctions = new Set(userBids.map((b) => b.productId))
      const activeBids = new Set(
        userBids
          .filter((b) => b.product.auctionStatus === 'active')
          .map((b) => b.productId),
      )
      const wonAuctions = userBids.filter(
        (b) => b.product.winnerId === context.user.id,
      )

      const totalSpent = paidWonAuctions.reduce(
        (sum, auction) => sum + parseFloat(auction.currentBid || '0'),
        0,
      )

      return {
        success: true,
        data: {
          totalBids: userBids.length,
          totalAuctions: uniqueAuctions.size,
          activeBids: activeBids.size,
          wonAuctions: wonAuctions.length,
          totalSpent: totalSpent,
        },
      }
    } catch (error) {
      console.error('Failed to get bid stats:', error)
      return {
        success: false,
        error: 'Failed to load statistics',
      }
    }
  })
