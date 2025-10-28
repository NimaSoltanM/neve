import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { shops } from '../schema'
import { eq } from 'drizzle-orm'
import z from 'zod'

export const checkSlugAvailability = createServerFn()
  .validator((input: unknown) => z.string().min(3).max(50).parse(input))
  .handler(async ({ data: slug }) => {
    try {
      const exists = await db.query.shops.findFirst({
        where: eq(shops.slug, slug),
        columns: { id: true }, // Only fetch id for performance
      })

      return {
        success: true,
        available: !exists, // true if slug is available (doesn't exist)
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to check slug availability',
      }
    }
  })
