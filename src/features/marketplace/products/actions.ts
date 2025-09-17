import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { products } from './schema'
import { shops } from '../shops/schema'
import {
  eq,
  and,
  gte,
  lte,
  ilike,
  desc,
  asc,
  sql,
  gt,
  lt,
  or,
} from 'drizzle-orm'
import { z } from 'zod'
import { bids } from '../bids/schema'

const createProductSchema = z.object({
  categoryId: z.number(),
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  images: z.array(z.string()).default([]),
  type: z.enum(['regular', 'auction']),
  // Regular fields
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  stock: z.number().min(0).optional(),
  // Auction fields
  startingPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  buyNowPrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  bidIncrement: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .optional(),
  auctionEndsAt: z.string().datetime().optional(),
})

// Create product (regular or auction)
export const createProduct = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => createProductSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      // Get user's shop
      const shop = await db.query.shops.findFirst({
        where: eq(shops.userId, context.user.id),
      })

      if (!shop) {
        return {
          success: false,
          error: 'You need to create a shop first',
        }
      }

      if (!shop.isActive) {
        return {
          success: false,
          error: 'Your shop is not active yet',
        }
      }

      // Validate type-specific fields
      if (
        data.type === 'regular' &&
        (!data.price || data.stock === undefined)
      ) {
        return {
          success: false,
          error: 'Regular products require price and stock',
        }
      }

      if (
        data.type === 'auction' &&
        (!data.startingPrice || !data.auctionEndsAt)
      ) {
        return {
          success: false,
          error: 'Auctions require starting price and end date',
        }
      }

      const [product] = await db
        .insert(products)
        .values({
          shopId: shop.id,
          categoryId: data.categoryId,
          name: data.name,
          slug: data.slug,
          description: data.description,
          images: data.images,
          type: data.type,
          // Regular fields
          price: data.type === 'regular' ? data.price : null,
          stock: data.type === 'regular' ? data.stock : null,
          // Auction fields
          startingPrice: data.type === 'auction' ? data.startingPrice : null,
          currentBid: data.type === 'auction' ? data.startingPrice : null, // starts at starting price
          buyNowPrice: data.type === 'auction' ? data.buyNowPrice : null,
          bidIncrement:
            data.type === 'auction' ? data.bidIncrement || '1.00' : null,
          auctionEndsAt:
            data.type === 'auction' ? new Date(data.auctionEndsAt!) : null,
        })
        .returning()

      return {
        success: true,
        data: product,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create product',
      }
    }
  })

// Get products with filters (updated for both types)
export const getProducts = createServerFn()
  .validator((input: unknown) =>
    z
      .object({
        categoryId: z.number().optional(),
        search: z.string().optional(),
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        shopId: z.number().optional(),
        type: z.enum(['all', 'regular', 'auction']).default('all'),
        endingSoon: z.boolean().optional(), // for auctions ending in next 24h
        sortBy: z
          .enum(['price_asc', 'price_desc', 'newest', 'ending_soon'])
          .default('newest'),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const offset = (data.page - 1) * data.limit

      // Build conditions
      const conditions = [
        eq(products.isActive, true),
        data.categoryId ? eq(products.categoryId, data.categoryId) : undefined,
        data.shopId ? eq(products.shopId, data.shopId) : undefined,
        data.search ? ilike(products.name, `%${data.search}%`) : undefined,
        data.type !== 'all' ? eq(products.type, data.type) : undefined,
      ].filter(Boolean)

      // Price filters work differently for regular vs auction
      if (data.minPrice || data.maxPrice) {
        conditions.push(
          or(
            // Regular products use price field
            and(
              eq(products.type, 'regular'),
              data.minPrice ? gte(products.price, data.minPrice) : undefined,
              data.maxPrice ? lte(products.price, data.maxPrice) : undefined,
            ),
            // Auctions use currentBid field
            and(
              eq(products.type, 'auction'),
              data.minPrice
                ? gte(products.currentBid, data.minPrice)
                : undefined,
              data.maxPrice
                ? lte(products.currentBid, data.maxPrice)
                : undefined,
            ),
          ),
        )
      }

      // Ending soon filter (next 24 hours)
      if (data.endingSoon) {
        const in24Hours = new Date()
        in24Hours.setHours(in24Hours.getHours() + 24)
        conditions.push(
          and(
            eq(products.type, 'auction'),
            lt(products.auctionEndsAt, in24Hours),
            gt(products.auctionEndsAt, new Date()),
          ),
        )
      }

      // Build ordering
      let orderBy
      if (data.sortBy === 'ending_soon') {
        orderBy = asc(products.auctionEndsAt)
      } else {
        orderBy =
          {
            price_asc: asc(products.price),
            price_desc: desc(products.price),
            newest: desc(products.createdAt),
          }[data.sortBy] || desc(products.createdAt)
      }

      const [items, totalResult] = await Promise.all([
        db.query.products.findMany({
          where: and(...conditions),
          with: {
            shop: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
            category: {
              columns: {
                id: true,
                name: true,
                slug: true,
              },
            },
            bids: {
              orderBy: (bids, { desc }) => [desc(bids.createdAt)],
              limit: 1, // just get latest bid
            },
          },
          orderBy,
          limit: data.limit,
          offset,
        }),
        db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(and(...conditions)),
      ])

      const total = Number(totalResult[0]?.count) || 0
      const totalPages = Math.ceil(total / data.limit)

      return {
        success: true,
        data: {
          items,
          pagination: {
            page: data.page,
            limit: data.limit,
            total,
            totalPages,
            hasNext: data.page < totalPages,
            hasPrev: data.page > 1,
          },
        },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load products',
      }
    }
  })

export const getProductBySlug = createServerFn()
  .validator((input: unknown) => z.string().min(1).parse(input))
  .handler(async ({ data: slug }) => {
    try {
      const product = await db.query.products.findFirst({
        where: and(eq(products.slug, slug), eq(products.isActive, true)),
        with: {
          shop: true,
          category: true,
        },
      })

      if (!product) {
        return {
          success: false,
          error: 'Product not found',
        }
      }

      return {
        success: true,
        data: product,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load product',
      }
    }
  })
// Update product (for shop owners)
export const updateProduct = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        productId: z.number(),
        name: z.string().min(2).max(100).optional(),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
        // Regular product fields
        price: z
          .string()
          .regex(/^\d+(\.\d{1,2})?$/)
          .optional(),
        stock: z.number().min(0).optional(),
        // Can't update auction prices after bids
        isActive: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      // Verify ownership
      const product = await db.query.products.findFirst({
        where: eq(products.id, data.productId),
        with: {
          shop: true,
          bids: {
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

      if (product.shop.userId !== context.user.id) {
        return {
          success: false,
          error: 'You can only edit your own products',
        }
      }

      // Can't update price if auction has bids
      if (
        product.type === 'auction' &&
        product.bids.length > 0 &&
        (data.price || data.stock !== undefined)
      ) {
        return {
          success: false,
          error: 'Cannot change auction details after bids are placed',
        }
      }

      const [updated] = await db
        .update(products)
        .set({
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.images && { images: data.images }),
          ...(data.price &&
            product.type === 'regular' && { price: data.price }),
          ...(data.stock !== undefined &&
            product.type === 'regular' && { stock: data.stock }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        })
        .where(eq(products.id, data.productId))
        .returning()

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update product',
      }
    }
  })

// Buy now for auction products
export const buyNow = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => z.number().parse(input))
  .handler(async ({ data: productId, context }) => {
    try {
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
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
          error: 'This is not an auction product',
        }
      }

      if (!product.buyNowPrice) {
        return {
          success: false,
          error: 'This auction does not have a buy now option',
        }
      }

      if (product.auctionEndsAt && new Date() > product.auctionEndsAt) {
        return {
          success: false,
          error: 'This auction has ended',
        }
      }

      // End auction and mark as sold
      await db.transaction(async (tx) => {
        // Mark product as inactive
        await tx
          .update(products)
          .set({
            isActive: false,
            auctionEndsAt: new Date(), // End it now
          })
          .where(eq(products.id, productId))

        // Record the buy now as a winning bid
        await tx.insert(bids).values({
          productId,
          userId: context.user.id,
          amount: product.buyNowPrice!, // We already checked it's not null above
          isWinning: true,
        })
      })

      return {
        success: true,
        data: {
          message: 'Purchase successful',
          amount: product.buyNowPrice,
        },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to complete purchase',
      }
    }
  })

// Get my products (for shop owners)
export const getMyProducts = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        page: z.number().default(1),
        limit: z.number().default(20),
        type: z.enum(['all', 'regular', 'auction']).default('all'),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      const shop = await db.query.shops.findFirst({
        where: eq(shops.userId, context.user.id),
      })

      if (!shop) {
        return {
          success: false,
          error: "You don't have a shop yet",
        }
      }

      const offset = (data.page - 1) * data.limit
      const conditions = [
        eq(products.shopId, shop.id),
        data.type !== 'all' ? eq(products.type, data.type) : undefined,
      ].filter(Boolean)

      const items = await db.query.products.findMany({
        where: and(...conditions),
        with: {
          category: {
            columns: {
              name: true,
              slug: true,
            },
          },
          bids: {
            where: eq(bids.isWinning, true),
            limit: 1,
          },
        },
        orderBy: desc(products.createdAt),
        limit: data.limit,
        offset,
      })

      return {
        success: true,
        data: items,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load your products',
      }
    }
  })

// Delete product (only if no bids/orders)
export const deleteProduct = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => z.number().parse(input))
  .handler(async ({ data: productId, context }) => {
    try {
      const product = await db.query.products.findFirst({
        where: eq(products.id, productId),
        with: {
          shop: true,
          bids: {
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

      if (product.shop.userId !== context.user.id) {
        return {
          success: false,
          error: 'You can only delete your own products',
        }
      }

      if (product.bids.length > 0) {
        return {
          success: false,
          error: 'Cannot delete product with bids',
        }
      }

      await db.delete(products).where(eq(products.id, productId))

      return {
        success: true,
        data: { message: 'Product deleted successfully' },
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete product',
      }
    }
  })
