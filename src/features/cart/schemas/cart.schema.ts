// src/features/cart/schemas/cart.schema.ts
import { relations } from 'drizzle-orm'
import {
  integer,
  text,
  timestamp,
  pgTable,
  decimal,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { products, users } from '@/server/db/schema'

export const carts = pgTable('carts', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['active', 'merged', 'converted'] })
    .notNull()
    .default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const cartItems = pgTable(
  'cart_items',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    cartId: integer('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    priceAtAdd: decimal('price_at_add', { precision: 10, scale: 2 }).notNull(),
    bidAmount: decimal('bid_amount', { precision: 10, scale: 2 }),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueCartProduct: uniqueIndex('unique_cart_product').on(
      table.cartId,
      table.productId,
    ),
  }),
)

// Relations
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}))

// Types
export type Cart = typeof carts.$inferSelect
export type NewCart = typeof carts.$inferInsert
export type CartItem = typeof cartItems.$inferSelect
export type NewCartItem = typeof cartItems.$inferInsert

// Local storage cart type (before auth)
export type LocalCartItem = {
  productId: number
  quantity: number
  bidAmount?: string
  addedAt: string
}

export type CartItemWithProduct = CartItem & {
  product: {
    id: number
    name: string
    slug: string
    type: 'regular' | 'auction'
    price: string | null
    images: string[]
    stock: number | null
    isActive: boolean
    // For auctions
    currentBid?: string | null
    auctionEndsAt?: Date | null
  }
}

export type CartWithItems = Cart & {
  items: CartItemWithProduct[]
}
