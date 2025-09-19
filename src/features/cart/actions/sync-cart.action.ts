import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { carts, cartItems } from '../schemas/cart.schema'
import { eq, and, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { products } from '@/server/db/schema'

const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number(),
      quantity: z.number(),
      bidAmount: z.string().optional(),
      addedAt: z.string(),
    }),
  ),
})

export const syncCart = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => syncCartSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      const userId = context.user.id
      const { items: localItems } = data

      if (localItems.length === 0) {
        return {
          success: true,
          data: {
            mergedCount: 0,
            conflicts: [],
          },
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

      // Get products info
      const productIds = localItems.map((item) => item.productId)
      const productsData = await db.query.products.findMany({
        where: inArray(products.id, productIds),
      })

      const productMap = new Map(productsData.map((p) => [p.id, p]))
      const conflicts: Array<{ productId: number; reason: string }> = []
      let mergedCount = 0

      // Get existing cart items
      const existingItems = await db.query.cartItems.findMany({
        where: and(
          eq(cartItems.cartId, cart.id),
          inArray(cartItems.productId, productIds),
        ),
      })

      const existingItemMap = new Map(
        existingItems.map((i) => [i.productId, i]),
      )

      // Process each local item
      for (const localItem of localItems) {
        const product = productMap.get(localItem.productId)

        if (!product || !product.isActive) {
          conflicts.push({
            productId: localItem.productId,
            reason: 'Product not available',
          })
          continue
        }

        // Check stock for regular products
        if (
          product.type === 'regular' &&
          (!product.stock || product.stock < localItem.quantity)
        ) {
          conflicts.push({
            productId: localItem.productId,
            reason: 'Insufficient stock',
          })
          continue
        }

        // Check auction status
        if (
          product.type === 'auction' &&
          product.auctionEndsAt &&
          new Date(product.auctionEndsAt) < new Date()
        ) {
          conflicts.push({
            productId: localItem.productId,
            reason: 'Auction has ended',
          })
          continue
        }

        const existingItem = existingItemMap.get(localItem.productId)

        if (existingItem) {
          // Merge quantities for regular products
          if (product.type === 'regular') {
            const newQuantity = Math.min(
              existingItem.quantity + localItem.quantity,
              product.stock || localItem.quantity,
            )

            await db
              .update(cartItems)
              .set({
                quantity: newQuantity,
                updatedAt: new Date(),
              })
              .where(eq(cartItems.id, existingItem.id))
          }
          // For auctions, keep the existing bid (don't override)
        } else {
          // Add new item
          await db.insert(cartItems).values({
            cartId: cart.id,
            productId: localItem.productId,
            quantity: product.type === 'regular' ? localItem.quantity : 1,
            priceAtAdd: product.price || '0',
            bidAmount: localItem.bidAmount,
          })
          mergedCount++
        }
      }

      // Update cart timestamp
      await db
        .update(carts)
        .set({ updatedAt: new Date() })
        .where(eq(carts.id, cart.id))

      return {
        success: true,
        data: {
          mergedCount,
          conflicts,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to sync cart',
      }
    }
  })
