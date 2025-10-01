import { createServerFn } from '@tanstack/react-start'
import { categories } from './schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import db from '@/server/db'

export const getCategories = createServerFn().handler(async () => {
  try {
    const allCategories = await db.query.categories.findMany({
      where: eq(categories.isActive, true),
      with: {
        children: {
          where: eq(categories.isActive, true),
          orderBy: (categories, { asc }) => [asc(categories.id)],
        },
      },
      orderBy: (categories, { asc }) => [asc(categories.id)],
    })

    return allCategories.filter((cat) => !cat.parentId)
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    throw new Error('Failed to fetch categories')
  }
})

export const getCategoryBySlug = createServerFn()
  .validator((slug: string) => {
    const schema = z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/)
    return schema.parse(slug)
  })
  .handler(async ({ data: slug }) => {
    const category = await db.query.categories.findFirst({
      where: and(eq(categories.slug, slug), eq(categories.isActive, true)),
      with: {
        parent: true,
        children: {
          where: eq(categories.isActive, true),
        },
      },
    })

    if (!category) {
      return {
        success: false,
        error: 'Category not found',
      }
    }

    return {
      success: true,
      data: category,
    }
  })
