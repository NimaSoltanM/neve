// src/features/cart/actions/get-cart.action.ts
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import { carts } from '../schemas/cart.schema'
import { eq, and } from 'drizzle-orm'
import db from '@/server/db'

export const getUserCart = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context.user.id

      // Get or create active cart
      let cart = await db.query.carts.findFirst({
        where: and(eq(carts.userId, userId), eq(carts.status, 'active')),
        with: {
          items: {
            with: {
              product: true,
            },
          },
        },
      })

      if (!cart) {
        // Create new cart
        const [newCart] = await db
          .insert(carts)
          .values({
            userId,
            status: 'active',
          })
          .returning()

        return {
          success: true,
          data: {
            ...newCart,
            items: [],
          },
        }
      }

      return {
        success: true,
        data: cart,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load cart',
      }
    }
  })
