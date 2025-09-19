import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { carts, cartItems } from '../schemas/cart.schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { products } from '@/server/db/schema'

const addToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1),
  bidAmount: z.string().optional(),
})

export const addToCart = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => addToCartSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const userId = context.user.id
      const { productId, quantity, bidAmount } = data

      // Validate product exists and is active
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
      })

      if (!product || !product.isActive) {
        return {
          success: false,
          error: 'Product not available',
        }
      }

      // Check stock for regular products
      if (product.type === 'regular') {
        if (!product.stock || product.stock < quantity) {
          return {
            success: false,
            error: 'Insufficient stock',
          }
        }
        if (!product.price) {
          return {
            success: false,
            error: 'Product price not set',
          }
        }
      }

      // Validate auction products
      if (product.type === 'auction') {
        if (!bidAmount) {
          return {
            success: false,
            error: 'Bid amount required for auction items',
          }
        }
        if (
          product.auctionEndsAt &&
          new Date(product.auctionEndsAt) < new Date()
        ) {
          return {
            success: false,
            error: 'Auction has ended',
          }
        }
        // Validate bid amount against current bid
        if (
          product.currentBid &&
          parseFloat(bidAmount) <= parseFloat(product.currentBid)
        ) {
          return {
            success: false,
            error: 'Bid must be higher than current bid',
          }
        }
      }

      // Get or create cart
      let cart = await db.query.carts.findFirst({
        where: and(eq(carts.userId, userId), eq(carts.status, 'active')),
      })

      if (!cart) {
        const [newCart] = await db
          .insert(carts)
          .values({
            userId,
            status: 'active',
          })
          .returning()
        cart = newCart
      }

      // Check if item already in cart
      const existingItem = await db.query.cartItems.findFirst({
        where: and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
        ),
      })

      if (existingItem) {
        // Update quantity for regular products
        if (product.type === 'regular') {
          const [updated] = await db
            .update(cartItems)
            .set({
              quantity: existingItem.quantity + quantity,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existingItem.id))
            .returning()

          return {
            success: true,
            data: updated,
          }
        } else {
          // Update bid for auction products
          const [updated] = await db
            .update(cartItems)
            .set({
              bidAmount,
              updatedAt: new Date(),
            })
            .where(eq(cartItems.id, existingItem.id))
            .returning()

          return {
            success: true,
            data: updated,
          }
        }
      } else {
        // Add new item
        const [newItem] = await db
          .insert(cartItems)
          .values({
            cartId: cart.id,
            productId,
            quantity: product.type === 'regular' ? quantity : 1,
            priceAtAdd: product.price || '0',
            bidAmount: product.type === 'auction' ? bidAmount : null,
          })
          .returning()

        // Update cart timestamp
        await db
          .update(carts)
          .set({ updatedAt: new Date() })
          .where(eq(carts.id, cart.id))

        return {
          success: true,
          data: newItem,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to add item to cart',
      }
    }
  })
