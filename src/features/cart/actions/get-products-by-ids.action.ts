import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { inArray } from 'drizzle-orm'
import { z } from 'zod'
import { products } from '@/server/db/schema'

const getProductsByIdsSchema = z.object({
  ids: z.array(z.number()),
})

export const getProductsByIds = createServerFn()
  .validator((input: unknown) => getProductsByIdsSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const { ids } = data

      if (ids.length === 0) {
        return {
          success: true,
          data: [],
        }
      }

      const items = await db.query.products.findMany({
        where: inArray(products.id, ids),
        with: {
          shop: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      })

      return {
        success: true,
        data: items,
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load products',
      }
    }
  })
