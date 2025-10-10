import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { shops, products } from '@/server/db/schema'
import { eq, and, ilike, sql, desc } from 'drizzle-orm'
import { z } from 'zod'

const getAllShopsSchema = z.object({
  search: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(12),
})

export const getAllShops = createServerFn()
  .validator((input: unknown) => getAllShopsSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const offset = (data.page - 1) * data.limit

      const conditions = [eq(shops.isActive, true)]

      if (data.search) {
        conditions.push(ilike(shops.name, `%${data.search}%`))
      }

      // Get shops with product count
      const shopsData = await db
        .select({
          id: shops.id,
          name: shops.name,
          slug: shops.slug,
          description: shops.description,
          logo: shops.logo,
          banner: shops.banner,
          isActive: shops.isActive,
          isVerified: shops.isVerified,
          createdAt: shops.createdAt,
          productCount: sql<number>`count(${products.id})::int`,
        })
        .from(shops)
        .leftJoin(
          products,
          and(eq(products.shopId, shops.id), eq(products.isActive, true)),
        )
        .where(and(...conditions))
        .groupBy(shops.id)
        .orderBy(desc(shops.createdAt))
        .limit(data.limit)
        .offset(offset)

      const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(shops)
        .where(and(...conditions))

      return {
        success: true,
        data: {
          shops: shopsData,
          total: count,
          totalPages: Math.ceil(count / data.limit),
          currentPage: data.page,
        },
      }
    } catch (error) {
      console.error('Get all shops error:', error)
      return {
        success: false,
        error: 'Failed to load shops',
      }
    }
  })
