import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  decimal,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { categories } from '@/features/marketplace/categories/schema'
import { shops } from '@/features/marketplace/shops/schema'
import { bids } from '../bids/schema'
import { users } from '@/server/db/schema'

export const productTypeEnum = pgEnum('product_type', ['regular', 'auction'])

export const auctionStatusEnum = pgEnum('auction_status', [
  'active',
  'ended',
  'paid',
  'cancelled',
])

export const products = pgTable('products', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  shopId: integer('shop_id')
    .notNull()
    .references(() => shops.id),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  images: jsonb('images').notNull().$type<string[]>().default([]),

  // Product type
  type: productTypeEnum('type').notNull().default('regular'),

  // Regular product fields
  price: decimal('price', { precision: 10, scale: 2 }), // for regular products
  stock: integer('stock').default(0), // for regular products

  // Auction fields
  startingPrice: decimal('starting_price', { precision: 10, scale: 2 }),
  currentBid: decimal('current_bid', { precision: 10, scale: 2 }),
  buyNowPrice: decimal('buy_now_price', { precision: 10, scale: 2 }), // optional instant buy
  bidIncrement: decimal('bid_increment', { precision: 10, scale: 2 }).default(
    '1.00',
  ),
  auctionEndsAt: timestamp('auction_ends_at'),

  // Auction finalization fields
  auctionStatus: auctionStatusEnum('auction_status').default('active'),
  winnerId: text('winner_id').references(() => users.id),
  endedAt: timestamp('ended_at'),
  paymentDeadline: timestamp('payment_deadline'),

  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const productsRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  bids: many(bids),
  winner: one(users, {
    fields: [products.winnerId],
    references: [users.id],
  }),
}))
