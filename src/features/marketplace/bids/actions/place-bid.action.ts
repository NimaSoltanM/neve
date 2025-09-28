import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { createNotification } from '@/features/notifications/actions/create-notification.action'
import { bids, products } from '@/server/db/schema'

const placeBidSchema = z.object({
  productId: z.number(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
})

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
        let wasExtended = false
        if (product.auctionEndsAt) {
          const timeLeft = product.auctionEndsAt.getTime() - now.getTime()
          const twoMinutes = 2 * 60 * 1000

          if (timeLeft > 0 && timeLeft < twoMinutes) {
            newEndTime = new Date(now.getTime() + twoMinutes)
            wasExtended = true
          }
        }

        // Store previous winner info for notification
        const previousWinnerId = product.bids[0]?.userId

        // Update previous winning bid
        if (product.bids[0]) {
          await tx
            .update(bids)
            .set({ isWinning: false })
            .where(eq(bids.id, product.bids[0].id))
        }

        // Insert new bid
        await tx
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

        // Send notifications after successful bid
        try {
          // Notify the previous highest bidder they've been outbid
          if (previousWinnerId) {
            await createNotification({
              data: {
                userId: previousWinnerId,
                type: 'bid.outbid',
                title: `You've been outbid!`,
                message: `Someone placed a higher bid of $${roundedBid.toFixed(2)} on "${product.name}". Current bid is now $${roundedBid.toFixed(2)}`,
                priority: 'high',
                actionUrl: `/products/${product.slug}`,
                metadata: {
                  productId: product.id,
                  productName: product.name,
                  newBid: roundedBid,
                  previousBid: currentBid,
                },
                groupKey: `auction-${product.id}`,
              },
            })
          }

          // Notify current bidder of successful bid
          await createNotification({
            data: {
              userId: context.user.id,
              type: 'bid.placed',
              title: `Bid placed successfully!`,
              message: `You're now the highest bidder on "${product.name}" with a bid of $${roundedBid.toFixed(2)}`,
              priority: 'normal',
              actionUrl: `/products/${product.slug}`,
              metadata: {
                productId: product.id,
                productName: product.name,
                bidAmount: roundedBid,
              },
              groupKey: `auction-${product.id}`,
            },
          })

          // If auction was extended, notify all recent bidders
          if (wasExtended) {
            // Get all unique bidders for this product
            const allBidders = await tx.query.bids.findMany({
              where: eq(bids.productId, data.productId),
              columns: { userId: true },
            })

            const uniqueBidderIds = [
              ...new Set(allBidders.map((b) => b.userId)),
            ]

            // Notify all bidders about extension
            await Promise.all(
              uniqueBidderIds.map((bidderId) =>
                createNotification({
                  data: {
                    userId: bidderId,
                    type: 'auction.ending',
                    title: `Auction extended!`,
                    message: `The auction for "${product.name}" has been extended by 2 minutes due to last-minute bidding`,
                    priority: 'high',
                    actionUrl: `/products/${product.slug}`,
                    metadata: {
                      productId: product.id,
                      productName: product.name,
                      newEndTime: newEndTime,
                    },
                    groupKey: `auction-${product.id}`,
                    expiresAt: newEndTime, // Expire when auction ends
                  },
                }),
              ),
            )
          }
        } catch (notifError) {
          // Don't fail the bid if notifications fail
          console.error('Failed to send notifications:', notifError)
        }

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
