import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { orders } from './order.schema'
import { products, shops } from '@/server/db/schema'

export const orderItems = pgTable(
  'order_items',
  {
    id: integer('id')
      .primaryKey()
      .generatedAlwaysAsIdentity({ startWith: 1000 }),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    shopId: integer('shop_id')
      .notNull()
      .references(() => shops.id, { onDelete: 'restrict' }),

    // Product snapshot at order time
    productSnapshot: jsonb('product_snapshot').notNull().$type<{
      name: string
      slug: string
      type: 'regular' | 'auction'
      images: string[]
      price?: string
      bidAmount?: string // For auction wins
    }>(),

    quantity: integer('quantity').notNull().default(1),
    unitPrice: text('unit_price').notNull(), // Price per unit at order time
    totalPrice: text('total_price').notNull(), // quantity * unitPrice

    // For auction items
    isAuctionWin: integer('is_auction_win').default(0), // boolean as 0/1

    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
    productIdIdx: index('order_items_product_id_idx').on(table.productId),
    shopIdIdx: index('order_items_shop_id_idx').on(table.shopId),
    // Prevent duplicate products in same order (for regular items)
    uniqueOrderProduct: uniqueIndex('order_product_unique').on(
      table.orderId,
      table.productId,
    ),
  }),
)

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  shop: one(shops, {
    fields: [orderItems.shopId],
    references: [shops.id],
  }),
}))

export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
