import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { products, categories, shops } from '@/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import type { ProductLocation } from '../types/highlight.types'
import { z } from 'zod'

const findProductLocationSchema = z.object({
  slug: z.string(),
  userId: z.string().optional(),
  preferredContext: z.enum(['marketplace', 'category', 'shop']).optional(),
})

export const findProductLocation = createServerFn({ method: 'POST' })
  .validator((data: unknown) => {
    return findProductLocationSchema.parse(data)
  })
  .handler(async ({ data }): Promise<ProductLocation> => {
    try {
      // First, find the product with all its relations
      const product = await db.query.products.findFirst({
        where: eq(products.slug, data.slug),
        with: {
          category: {
            with: {
              parent: true, // Get parent category if exists
            },
          },
          shop: true,
        },
      })

      if (!product) {
        // Try to find similar products for suggestions
        const similarProducts = await db
          .select({
            name: products.name,
            slug: products.slug,
          })
          .from(products)
          .where(
            sql`LOWER(${products.name}) LIKE LOWER(${'%' + data.slug.split('-').join('%') + '%'})`,
          )
          .limit(3)

        return {
          found: false,
          suggestions: similarProducts
            .map((p) => ({
              name: p.name,
              slug: p.slug,
              similarity: calculateSimilarity(p.slug, data.slug),
            }))
            .sort((a, b) => b.similarity - a.similarity),
        }
      }

      // Determine the best context to show the product
      const contexts: ProductLocation[] = []

      // 1. Category context (most common)
      if (product.category) {
        const categorySlug = product.category.parent
          ? product.category.slug
          : product.category.slug

        contexts.push({
          found: true,
          route: '/categories/$slug',
          params: { slug: categorySlug },
          search: {
            page: 1,
            // We'll calculate the actual page in a moment
            highlight: product.slug,
          },
          context: 'category',
        })
      }

      // 2. Shop context (if viewing seller's products)
      if (product.shop) {
        contexts.push({
          found: true,
          route: '/shops/$slug',
          params: { slug: product.shop.slug },
          search: {
            page: 1,
            highlight: product.slug,
          },
          context: 'shop',
        })
      }

      // 3. Marketplace context (general browsing)
      contexts.push({
        found: true,
        route: '/marketplace',
        params: {},
        search: {
          page: 1,
          search: product.name.split(' ')[0], // Use first word for search
          highlight: product.slug,
        },
        context: 'marketplace',
      })

      // Now calculate which page the product would be on
      for (const context of contexts) {
        if (context.found) {
          const page = await calculateProductPage(
            product.id.toString(),
            context,
          )
          context.search.page = page
        }
      }

      // Choose the best context based on preference or default logic
      if (data.preferredContext) {
        const preferred = contexts.find(
          (c) => c.found && c.context === data.preferredContext,
        )
        if (preferred) return preferred
      }

      // Default priority: category > shop > marketplace
      return (
        contexts.find((c) => c.found) || {
          found: false,
          suggestions: [],
        }
      )
    } catch (error) {
      console.error('[findProductLocation] Error:', error)
      return { found: false }
    }
  })

// Helper: Calculate which page a product appears on
async function calculateProductPage(
  productId: string,
  context: ProductLocation & { found: true },
): Promise<number> {
  const ITEMS_PER_PAGE = 20 // Match your pagination

  try {
    let position = 0

    if (context.context === 'category' && context.params.slug) {
      // Find product position in category
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, context.params.slug),
      })

      if (category) {
        // Count products that would appear before this one
        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(products)
          .where(
            and(
              eq(products.categoryId, category.id),
              sql`${products.createdAt} > (SELECT created_at FROM products WHERE id = ${productId})`,
            ),
          )

        position = result[0]?.count || 0
      }
    } else if (context.context === 'shop' && context.params.slug) {
      // Find product position in shop
      const shop = await db.query.shops.findFirst({
        where: eq(shops.slug, context.params.slug),
      })

      if (shop) {
        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(products)
          .where(
            and(
              eq(products.shopId, shop.id),
              sql`${products.createdAt} > (SELECT created_at FROM products WHERE id = ${productId})`,
            ),
          )

        position = result[0]?.count || 0
      }
    } else {
      // Marketplace - just estimate page 1 for now
      return 1
    }

    return Math.floor(position / ITEMS_PER_PAGE) + 1
  } catch (error) {
    console.error('[calculateProductPage] Error:', error)
    return 1 // Default to page 1 on error
  }
}

// Helper: Calculate string similarity (Levenshtein distance)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1

  if (longer.length === 0) return 1.0

  const editDistance = levenshteinDistance(longer, shorter)
  return (longer.length - editDistance) / longer.length
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}
