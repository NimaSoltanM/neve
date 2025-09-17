import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { bids } from './schema'
import { products } from '../products/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

const placeBidSchema = z.object({
  productId: z.number(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
})

// Place a bid on an auction
// Place a bid on an auction (with better validation)
export const placeBid = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => placeBidSchema.parse(input))
  .handler(async ({ data, context }) => {
    return await db.transaction(async (tx) => {
      try {
        // Lock the product row to prevent race conditions
        const product = await tx.query.products.findFirst({
          where: eq(products.id, data.productId),
          with: {
            bids: {
              where: eq(bids.isWinning, true),
              limit: 1,
            },
          },
        })

        if (!product) {
          return {
            success: false,
            error: 'Product not found',
          }
        }

        if (product.type !== 'auction') {
          return {
            success: false,
            error: 'This product is not an auction',
          }
        }

        // Check if auction ended
        const now = new Date()
        if (product.auctionEndsAt && now >= product.auctionEndsAt) {
          return {
            success: false,
            error: 'This auction has ended',
          }
        }

        const bidAmount = parseFloat(data.amount)

        // Validate against negative or invalid amounts
        if (bidAmount <= 0 || isNaN(bidAmount)) {
          return {
            success: false,
            error: 'Invalid bid amount',
          }
        }

        // Round to 2 decimal places to avoid floating point issues
        const roundedBid = Math.round(bidAmount * 100) / 100

        const currentBid = product.currentBid
          ? parseFloat(product.currentBid)
          : 0
        const startingPrice = product.startingPrice
          ? parseFloat(product.startingPrice)
          : 0
        const minBid =
          Math.max(currentBid, startingPrice) +
          parseFloat(product.bidIncrement || '1.00')

        // Validate minimum bid
        if (roundedBid < minBid) {
          return {
            success: false,
            error: `Minimum bid is ${minBid.toFixed(2)}`,
          }
        }

        // Check if user is already the highest bidder
        if (product.bids[0]?.userId === context.user.id) {
          return {
            success: false,
            error: 'You are already the highest bidder',
          }
        }

        // Anti-sniping: Extend auction by 2 minutes if bid in last 2 minutes
        let newEndTime = product.auctionEndsAt
        if (product.auctionEndsAt) {
          const timeLeft = product.auctionEndsAt.getTime() - now.getTime()
          const twoMinutes = 2 * 60 * 1000

          if (timeLeft > 0 && timeLeft < twoMinutes) {
            newEndTime = new Date(now.getTime() + twoMinutes)
          }
        }

        // Update previous winning bid
        if (product.bids[0]) {
          await tx
            .update(bids)
            .set({ isWinning: false })
            .where(eq(bids.id, product.bids[0].id))
        }

        // Insert new bid
        const [newBid] = await tx
          .insert(bids)
          .values({
            productId: data.productId,
            userId: context.user.id,
            amount: roundedBid.toFixed(2),
            isWinning: true,
          })
          .returning()

        // Update product
        await tx
          .update(products)
          .set({
            currentBid: roundedBid.toFixed(2),
            ...(newEndTime !== product.auctionEndsAt && {
              auctionEndsAt: newEndTime,
            }),
          })
          .where(eq(products.id, data.productId))

        return {
          success: true,
          data: {
            amount: roundedBid.toFixed(2),
            extended: newEndTime !== product.auctionEndsAt,
          },
        }
      } catch (error) {
        console.error('Bid error:', error)
        return {
          success: false,
          error: 'Failed to place bid. Please try again.',
        }
      }
    })
  })
// Get bid history for a product
export const getBidHistory = createServerFn()
  .validator((input: unknown) => z.number().parse(input))
  .handler(async ({ data: productId }) => {
    try {
      const bidHistory = await db.query.bids.findMany({
        where: eq(bids.productId, productId),
        with: {
          user: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: desc(bids.createdAt),
        limit: 20,
      })

      return {
        success: true,
        data: bidHistory.map((bid) => ({
          id: bid.id,
          amount: bid.amount,
          isWinning: bid.isWinning,
          userName: `${bid.user.firstName} ${bid.user.lastName?.[0]}.`, // John D.
          createdAt: bid.createdAt,
        })),
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load bid history',
      }
    }
  })

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
