import {
  pgTable,
  text,
  integer,
  timestamp,
  decimal,
  boolean,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products } from '@/features/marketplace/products/schema'
import { users } from '@/server/db/schema'

export const bids = pgTable('bids', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  isWinning: boolean('is_winning').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const bidsRelations = relations(bids, ({ one }) => ({
  product: one(products, {
    fields: [bids.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [bids.userId],
    references: [users.id],
  }),
}))
