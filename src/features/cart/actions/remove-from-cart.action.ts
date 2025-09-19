import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { carts, cartItems } from '../schemas/cart.schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const removeFromCartSchema = z.object({
  productId: z.number(),
})

export const removeFromCart = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => removeFromCartSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const userId = context.user.id
      const { productId } = data

      // Get user's active cart
      const cart = await db.query.carts.findFirst({
        where: and(eq(carts.userId, userId), eq(carts.status, 'active')),
      })

      if (!cart) {
        return {
          success: false,
          error: 'No active cart found',
        }
      }

      // Find and delete cart item
      const item = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
        ),
      })

      if (!item) {
        return {
          success: false,
          error: 'Item not in cart',
        }
      }

      await db.delete(cartItems).where(eq(cartItems.id, item.id))

      // Update cart timestamp
      await db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id))

      return {
        success: true,
        data: { productId },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to remove item from cart',
      }
    }
  })
