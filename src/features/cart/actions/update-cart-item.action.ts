import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { carts, cartItems } from '../schemas/cart.schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'

const updateCartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(0).optional(),
  bidAmount: z.string().optional(),
})

export const updateCartItem = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => updateCartItemSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const userId = context.user.id
      const { productId, quantity, bidAmount } = data

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

      // Find cart item
      const item = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
        ),
        with: {
          product: true,
        },
      })

      if (!item) {
        return {
          success: false,
          error: 'Item not in cart',
        }
      }

      // Remove item if quantity is 0
      if (quantity === 0) {
        await db.delete(cartItems).where(eq(cartItems.id, item.id))

        // Update cart timestamp
        await db
          .update(carts)
          .set({ updatedAt: new Date() })
          .where(eq(carts.id, cart.id))

        return {
          success: true,
          data: { removed: true },
        }
      }

      // Validate stock for quantity updates
      if (quantity && item.product.type === 'regular') {
        if (!item.product.stock || item.product.stock < quantity) {
          return {
            success: false,
            error: 'Insufficient stock',
          }
        }
      }

      // Build update data
      const updateData: any = {
        updatedAt: new Date(),
      }

      if (quantity !== undefined) {
        updateData.quantity = quantity
      }

      if (bidAmount !== undefined && item.product.type === 'auction') {
        updateData.bidAmount = bidAmount
      }

      const [updated] = await db
        .update(cartItems)
        .set(updateData)
        .where(eq(cartItems.id, item.id))
        .returning()

      // Update cart timestamp
      await db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id))

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update cart item',
      }
    }
  })
