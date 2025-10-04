import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import { shops } from './schema'
import { eq, and, desc } from 'drizzle-orm'
import { z } from 'zod'
import db from '@/server/db'
import { products } from '../products/schema'

const createShopSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  description: z
    .object({
      en: z.string().default(''),
      fa: z.string().default(''),
    })
    .optional(),
})

// Create shop (one per user)
export const createShop = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => createShopSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      // Check if user already has a shop
      const existingShop = await db.query.shops.findFirst({
        where: eq(shops.userId, context.user.id),
      })

      if (existingShop) {
        return {
          success: false,
          error: 'You already have a shop',
        }
      }

      // Check if slug is taken
      const slugExists = await db.query.shops.findFirst({
        where: eq(shops.slug, data.slug),
      })

      if (slugExists) {
        return {
          success: false,
          error: 'This shop URL is already taken',
        }
      }

      const [shop] = await db
        .insert(shops)
        .values({
          userId: context.user.id,
          name: data.name,
          slug: data.slug,
          description: data.description
            ? {
                en: data.description.en || '',
                fa: data.description.fa || '',
              }
            : null,
        })
        .returning()

      return {
        success: true,
        data: shop,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create shop. Please try again.',
      }
    }
  })

// Get shop by slug
export const getShopBySlug = createServerFn()
  .validator((input: unknown) => z.string().min(1).parse(input))
  .handler(async ({ data: slug }) => {
    try {
      const shop = await db.query.shops.findFirst({
        where: and(eq(shops.slug, slug), eq(shops.isActive, true)),
        with: {
          owner: {
            columns: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      if (!shop) {
        return {
          success: false,
          error: 'Shop not found',
        }
      }

      return {
        success: true,
        data: shop,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load shop',
      }
    }
  })

// Get current user's shop
export const getMyShop = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const shop = await db.query.shops.findFirst({
        where: eq(shops.userId, context.user.id),
        with: {
          products: {
            limit: 5,
            orderBy: desc(products.createdAt),
          },
        },
      })

      if (!shop) {
        return {
          success: false,
          error: "You don't have a shop yet",
        }
      }

      return {
        success: true,
        data: shop,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load your shop',
      }
    }
  })

// Update shop details
export const updateShop = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        name: z.string().min(2).max(50).optional(),
        description: z
          .object({
            en: z.string(),
            fa: z.string(),
          })
          .optional(),
        logo: z.string().optional(),
        banner: z.string().optional(),
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
          error: 'Shop not found',
        }
      }

      const [updated] = await db
        .update(shops)
        .set({
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.logo !== undefined && { logo: data.logo }),
          ...(data.banner !== undefined && { banner: data.banner }),
        })
        .where(eq(shops.id, shop.id))
        .returning()

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update shop',
      }
    }
  })

// Get products from a specific shop
export const getShopProducts = createServerFn()
  .validator((input: unknown) =>
    z
      .object({
        shopId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    try {
      const offset = (data.page - 1) * data.limit

      const items = await db.query.products.findMany({
        where: and(
          eq(products.shopId, data.shopId),
          eq(products.isActive, true),
        ),
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
        error: 'Failed to load shop products',
      }
    }
  })

export const toggleShopActivation = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        isActive: z.boolean(),
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
          error: 'Shop not found',
        }
      }

      const [updated] = await db
        .update(shops)
        .set({
          isActive: data.isActive,
        })
        .where(eq(shops.id, shop.id))
        .returning()

      return {
        success: true,
        data: updated,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update shop status',
      }
    }
  })
