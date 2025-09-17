import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import { eq, and, ne } from 'drizzle-orm'
import { z } from 'zod'
import { bids, categories, products, shops } from '@/server/db/schema'
import db from '@/server/db'
import { generateSlug } from '@/lib/utils'

// Get user's active shops for product form
export const getUserShops = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userShops = await db.query.shops.findMany({
      where: and(
        eq(shops.userId, context.user.id),
        eq(shops.isActive, true), // Only active shops can add products
      ),
      columns: {
        id: true,
        name: true,
        isActive: true,
      },
    })

    return {
      success: true,
      data: userShops,
    }
  })

// Schema for creating/updating products
const productSchema = z.object({
  shopId: z.number(),
  name: z.string().min(3).max(200),
  description: z.string().optional(),
  categoryId: z.number(),
  type: z.enum(['regular', 'auction']),
  images: z.array(z.string()).min(1, 'At least one image required').max(10),
  // Regular product fields
  price: z.string().optional(),
  stock: z.number().min(0).optional(),
  // Auction fields
  startingPrice: z.string().optional(),
  bidIncrement: z.string().default('1.00'),
  buyNowPrice: z.string().optional().nullable(),
  auctionEndsAt: z.string().optional(), // ISO date string
})

// Helper to verify shop ownership
async function verifyShopOwnership(shopId: number, userId: string) {
  const shop = await db.query.shops.findFirst({
    where: eq(shops.id, shopId),
  })

  if (!shop) {
    throw new Error('Shop not found')
  }

  if (shop.userId !== userId) {
    throw new Error('Unauthorized: You do not own this shop')
  }

  if (!shop.isActive) {
    throw new Error('Shop is inactive. Activate your shop to add products')
  }

  return shop
}

// Helper to verify product ownership (for edit/delete)
async function verifyProductOwnership(productId: number, userId: string) {
  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    with: {
      shop: true,
    },
  })

  if (!product) {
    throw new Error('Product not found')
  }

  if (product.shop.userId !== userId) {
    throw new Error('Unauthorized: You do not own this product')
  }

  return product
}

// Create product
export const createProduct = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
      // Verify shop ownership
      await verifyShopOwnership(data.shopId, context.user.id)

      // Verify category exists
      const category = await db.query.categories.findFirst({
        where: eq(categories.id, data.categoryId),
      })

      if (!category) {
        return {
          success: false,
          error: 'Invalid category',
        }
      }

      // Generate unique slug
      let slug = generateSlug(data.name)
      let slugExists = true
      let counter = 0

      while (slugExists) {
        const existingProduct = await db.query.products.findFirst({
          where: eq(products.slug, counter > 0 ? `${slug}-${counter}` : slug),
        })

        if (!existingProduct) {
          slugExists = false
          if (counter > 0) slug = `${slug}-${counter}`
        } else {
          counter++
        }
      }

      // Validate type-specific fields
      if (data.type === 'regular') {
        if (!data.price || parseFloat(data.price) <= 0) {
          return {
            success: false,
            error: 'Regular products require a valid price',
          }
        }
        if (data.stock === undefined || data.stock < 0) {
          return {
            success: false,
            error: 'Regular products require stock quantity',
          }
        }
      } else if (data.type === 'auction') {
        if (!data.startingPrice || parseFloat(data.startingPrice) <= 0) {
          return {
            success: false,
            error: 'Auctions require a starting price',
          }
        }
        if (!data.auctionEndsAt) {
          return {
            success: false,
            error: 'Auctions require an end date',
          }
        }

        const endDate = new Date(data.auctionEndsAt)
        if (endDate <= new Date()) {
          return {
            success: false,
            error: 'Auction end date must be in the future',
          }
        }

        // Validate buy now price is higher than starting price
        if (data.buyNowPrice) {
          const buyNow = parseFloat(data.buyNowPrice)
          const starting = parseFloat(data.startingPrice)
          if (buyNow <= starting) {
            return {
              success: false,
              error: 'Buy now price must be higher than starting price',
            }
          }
        }
      }

      // Insert product
      const [newProduct] = await db
        .insert(products)
        .values({
          shopId: data.shopId,
          categoryId: data.categoryId,
          name: data.name,
          slug,
          description: data.description || null,
          type: data.type,
          images: data.images,
          price: data.type === 'regular' ? data.price : null,
          stock: data.type === 'regular' ? data.stock : null,
          startingPrice: data.type === 'auction' ? data.startingPrice : null,
          currentBid: data.type === 'auction' ? data.startingPrice : null,
          bidIncrement: data.type === 'auction' ? data.bidIncrement : null,
          buyNowPrice: data.type === 'auction' ? data.buyNowPrice : null,
          auctionEndsAt:
            data.type === 'auction' ? new Date(data.auctionEndsAt!) : null,
          isActive: true,
        })
        .returning()

      return {
        success: true,
        data: newProduct,
      }
    } catch (error) {
      console.error('Create product error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create product',
      }
    }
  })

// Update product
export const updateProduct = createServerFn()
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const schema = productSchema.extend({ id: z.number() })
    return schema.parse(input)
  })
  .handler(async ({ data, context }) => {
    try {
      // Verify product ownership
      const existingProduct = await verifyProductOwnership(
        data.id,
        context.user.id,
      )

      // Verify new shop ownership if shop changed
      if (data.shopId !== existingProduct.shopId) {
        await verifyShopOwnership(data.shopId, context.user.id)
      }

      // Check if there are active bids (can't edit auction with bids)
      if (existingProduct.type === 'auction') {
        const bidCount = await db.query.bids.findFirst({
          where: eq(bids.productId, data.id),
        })

        if (bidCount) {
          return {
            success: false,
            error: 'Cannot edit auction with existing bids',
          }
        }
      }

      // Generate new slug if name changed
      let slug = existingProduct.slug
      if (data.name !== existingProduct.name) {
        slug = generateSlug(data.name)

        // Ensure unique slug
        const slugExists = await db.query.products.findFirst({
          where: and(eq(products.slug, slug), ne(products.id, data.id)),
        })

        if (slugExists) {
          slug = `${slug}-${Date.now()}`
        }
      }

      // Validate type-specific fields (same as create)
      if (data.type === 'regular') {
        if (!data.price || parseFloat(data.price) <= 0) {
          return {
            success: false,
            error: 'Regular products require a valid price',
          }
        }
      } else if (data.type === 'auction') {
        if (!data.startingPrice || parseFloat(data.startingPrice) <= 0) {
          return {
            success: false,
            error: 'Auctions require a starting price',
          }
        }

        const endDate = new Date(data.auctionEndsAt!)
        if (endDate <= new Date()) {
          return {
            success: false,
            error: 'Auction end date must be in the future',
          }
        }
      }

      // Update product
      const [updatedProduct] = await db
        .update(products)
        .set({
          shopId: data.shopId,
          categoryId: data.categoryId,
          name: data.name,
          slug,
          description: data.description || null,
          type: data.type,
          images: data.images,
          price: data.type === 'regular' ? data.price : null,
          stock: data.type === 'regular' ? data.stock : null,
          startingPrice: data.type === 'auction' ? data.startingPrice : null,
          bidIncrement: data.type === 'auction' ? data.bidIncrement : null,
          buyNowPrice: data.type === 'auction' ? data.buyNowPrice : null,
          auctionEndsAt:
            data.type === 'auction' ? new Date(data.auctionEndsAt!) : null,
        })
        .where(eq(products.id, data.id))
        .returning()

      return {
        success: true,
        data: updatedProduct,
      }
    } catch (error) {
      console.error('Update product error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update product',
      }
    }
  })

// Delete product
export const deleteProduct = createServerFn()
  .middleware([authMiddleware])
  .validator((id: number) => z.number().parse(id))
  .handler(async ({ data: productId, context }) => {
    try {
      // Verify product ownership
      const product = await verifyProductOwnership(productId, context.user.id)

      // Check if there are active bids
      if (product.type === 'auction') {
        const bidCount = await db.query.bids.findFirst({
          where: eq(bids.productId, productId),
        })

        if (bidCount) {
          return {
            success: false,
            error: 'Cannot delete auction with existing bids',
          }
        }
      }

      // Soft delete (set inactive) instead of hard delete
      await db
        .update(products)
        .set({ isActive: false })
        .where(eq(products.id, productId))

      return {
        success: true,
        message: 'Product deleted successfully',
      }
    } catch (error) {
      console.error('Delete product error:', error)
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to delete product',
      }
    }
  })

// Get user's products
export const getUserProducts = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userShops = await db.query.shops.findMany({
      where: eq(shops.userId, context.user.id),
      with: {
        products: {
          where: eq(products.isActive, true),
          with: {
            category: true,
          },
        },
      },
    })

    // Flatten products from all user's shops
    const allProducts = userShops.flatMap((shop) =>
      shop.products.map((product) => ({
        ...product,
        shopName: shop.name,
      })),
    )

    return {
      success: true,
      data: allProducts,
    }
  })
