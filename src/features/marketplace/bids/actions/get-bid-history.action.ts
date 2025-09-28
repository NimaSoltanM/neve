import db from '@/server/db'
import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import z from 'zod'
import { bids } from '../schema'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'

export const getBidHistory = createServerFn()
  .middleware([authMiddleware])
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
