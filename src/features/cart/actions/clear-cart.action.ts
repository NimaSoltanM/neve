import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { carts, cartItems } from '../schemas/cart.schema'
import { eq, and } from 'drizzle-orm'

export const clearCart = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const userId = context.user.id

      // Get active cart
      const cart = await db.query.carts.findFirst({
        where: and(eq(carts.userId, userId), eq(carts.status, 'active')),
      })

      if (!cart) {
        return {
          success: true,
          data: { message: 'Cart already empty' },
        }
      }

      // Delete all cart items
      await db.delete(cartItems).where(eq(cartItems.cartId, cart.id))

      // Update cart timestamp
      await db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id))

      return {
        success: true,
        data: { message: 'Cart cleared successfully' },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to clear cart',
      }
    }
  })
