import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { eq, and, lte } from 'drizzle-orm'
import { createNotification } from '@/features/notifications/actions/create-notification.action'
import { bids, cartItems, carts, products } from '@/server/db/schema'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'

export const finalizeEndedAuctions = createServerFn()
  .middleware([authMiddleware])
  .handler(async () => {
    const now = new Date()

    try {
      // Find all auctions that have ended but not yet finalized
      const endedAuctions = await db.query.products.findMany({
        where: and(
          eq(products.type, 'auction'),
          eq(products.auctionStatus, 'active'),
          lte(products.auctionEndsAt, now),
        ),
        with: {
          bids: {
            where: eq(bids.isWinning, true),
            limit: 1,
            with: {
              user: true,
            },
          },
          shop: {
            columns: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
      })

      const results: any = []

      for (const auction of endedAuctions) {
        await db.transaction(async (tx) => {
          try {
            const winningBid = auction.bids[0]

            if (!winningBid) {
              // No bids - mark as ended without winner
              await tx
                .update(products)
                .set({
                  auctionStatus: 'ended',
                  endedAt: now,
                })
                .where(eq(products.id, auction.id))

              // Notify seller that auction ended with no bids
              if (auction.shop?.userId) {
                await createNotification({
                  data: {
                    userId: auction.shop.userId,
                    type: 'auction.ended.no_bids',
                    title: 'Auction ended without bids',
                    message: `Your auction for "${auction.name}" ended without any bids`,
                    priority: 'normal',
                    actionUrl: `/seller/products/${auction.id}`,
                    metadata: {
                      productId: auction.id,
                      productName: auction.name,
                    },
                  },
                })
              }

              results.push({
                productId: auction.id,
                status: 'ended_no_bids',
              })
              return
            }

            // Calculate payment deadline (48 hours from now)
            const paymentDeadline = new Date(
              now.getTime() + 48 * 60 * 60 * 1000,
            )

            // Update product with winner info
            await tx
              .update(products)
              .set({
                auctionStatus: 'ended',
                winnerId: winningBid.userId,
                endedAt: now,
                paymentDeadline,
                stock: 0, // Mark as out of stock
              })
              .where(eq(products.id, auction.id))

            // Add to winner's cart automatically
            let cart = await tx.query.carts.findFirst({
              where: and(
                eq(carts.userId, winningBid.userId),
                eq(carts.status, 'active'),
              ),
            })

            if (!cart) {
              const [newCart] = await tx
                .insert(carts)
                .values({
                  userId: winningBid.userId,
                  status: 'active',
                })
                .returning()
              cart = newCart
            }

            // Add won item to cart with the winning bid amount
            await tx
              .insert(cartItems)
              .values({
                cartId: cart.id,
                productId: auction.id,
                quantity: 1,
                priceAtAdd: winningBid.amount,
                bidAmount: winningBid.amount, // Store the winning bid
              })
              .onConflictDoNothing() // In case it's already there

            // Get all unique bidders for this auction
            const allBids = await tx.query.bids.findMany({
              where: eq(bids.productId, auction.id),
              columns: {
                userId: true,
                amount: true,
                isWinning: true,
              },
              with: {
                user: {
                  columns: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            })

            const uniqueBidders = Array.from(
              new Map(allBids.map((b) => [b.userId, b.user])).values(),
            )

            // Send notifications

            // 1. Notify winner
            await createNotification({
              data: {
                userId: winningBid.userId,
                type: 'auction.won',
                title: '🎉 Congratulations! You won the auction!',
                message: `You won "${auction.name}" for ${winningBid.amount}. Item has been added to your cart. Please complete payment within 48 hours.`,
                priority: 'urgent',
                actionUrl: '/dashboard/notifications',
                metadata: {
                  productId: auction.id,
                  productName: auction.name,
                  winningBid: winningBid.amount,
                  paymentDeadline: paymentDeadline.toISOString(),
                },
              },
            })

            // 2. Notify seller
            if (auction.shop?.userId) {
              await createNotification({
                data: {
                  userId: auction.shop.userId,
                  type: 'auction.sold',
                  title: 'Auction ended - Item sold!',
                  message: `Your auction for "${auction.name}" ended with a winning bid of ${winningBid.amount} by ${winningBid.user.firstName} ${winningBid.user.lastName}`,
                  priority: 'high',
                  actionUrl: `/seller/orders`,
                  metadata: {
                    productId: auction.id,
                    productName: auction.name,
                    winningBid: winningBid.amount,
                    winnerId: winningBid.userId,
                    winnerName: `${winningBid.user.firstName} ${winningBid.user.lastName}`,
                    paymentDeadline: paymentDeadline.toISOString(),
                  },
                },
              })
            }

            // 3. Notify losing bidders
            const losingBidders = uniqueBidders.filter(
              (bidder) => bidder.id !== winningBid.userId,
            )

            for (const loser of losingBidders) {
              await createNotification({
                data: {
                  userId: loser.id,
                  type: 'auction.lost',
                  title: 'Auction ended',
                  message: `The auction for "${auction.name}" has ended. The winning bid was ${winningBid.amount}. Better luck next time!`,
                  priority: 'low',
                  actionUrl: `/marketplace`,
                  metadata: {
                    productId: auction.id,
                    productName: auction.name,
                    winningBid: winningBid.amount,
                  },
                },
              })
            }

            results.push({
              productId: auction.id,
              status: 'finalized',
              winnerId: winningBid.userId,
              amount: winningBid.amount,
            })
          } catch (error) {
            console.error(`Failed to finalize auction ${auction.id}:`, error)
            results.push({
              productId: auction.id,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unknown error',
            })
          }
        })
      }

      return {
        success: true,
        processed: results.length,
        results,
      }
    } catch (error) {
      console.error('Failed to finalize auctions:', error)
      return {
        success: false,
        error: 'Failed to process ended auctions',
      }
    }
  })
