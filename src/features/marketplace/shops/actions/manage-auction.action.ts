import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { shops } from '../schema'
import { products } from '@/features/marketplace/products/schema'
import { eq, and } from 'drizzle-orm'

export const endAuctionEarly = createServerFn()
  .middleware([authMiddleware])
  .validator((productId: number) => productId)
  .handler(async ({ data: productId, context }) => {
    const shop = await db.query.shops.findFirst({
      where: eq(shops.userId, context.user.id),
    })

    if (!shop) {
      return { success: false, error: 'Shop not found' }
    }

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.shopId, shop.id)),
    })

    if (!product || product.type !== 'auction') {
      return { success: false, error: 'Auction not found' }
    }

    await db
      .update(products)
      .set({
        auctionStatus: 'cancelled',
        endedAt: new Date(),
      })
      .where(eq(products.id, productId))

    return { success: true }
  })

export const duplicateAuction = createServerFn()
  .middleware([authMiddleware])
  .validator((productId: number) => productId)
  .handler(async ({ data: productId, context }) => {
    const shop = await db.query.shops.findFirst({
      where: eq(shops.userId, context.user.id),
    })

    if (!shop) {
      return { success: false, error: 'Shop not found' }
    }

    const original = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.shopId, shop.id)),
    })

    if (!original || original.type !== 'auction') {
      return { success: false, error: 'Auction not found' }
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        shopId: original.shopId,
        categoryId: original.categoryId,
        slug: `${original.slug}-copy-${Date.now()}`,
        name: `${original.name} (Copy)`,
        description: original.description,
        images: original.images,
        type: 'auction',
        startingPrice: original.startingPrice,
        currentBid: null,
        buyNowPrice: original.buyNowPrice,
        bidIncrement: original.bidIncrement,
        auctionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        auctionStatus: 'active',
        winnerId: null,
        endedAt: null,
        paymentDeadline: null,
        isActive: true,
      })
      .returning()

    return { success: true, data: newProduct }
  })
