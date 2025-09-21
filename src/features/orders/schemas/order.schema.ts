import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '@/server/db/schema'
import { orderItems } from './order-item.schema'

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'completed',
  'cancelled',
])

export const orders = pgTable(
  'orders',
  {
    id: integer('id')
      .primaryKey()
      .generatedAlwaysAsIdentity({ startWith: 1000 }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // Simple address storage
    shippingAddress: jsonb('shipping_address').notNull().$type<{
      fullName: string
      phoneNumber: string
      address: string
      city: string
      postalCode: string
    }>(),

    totalAmount: text('total_amount').notNull(), // Store as string for precision
    status: orderStatusEnum('status').notNull().default('pending'),

    // Simple payment tracking
    paymentMethod: text('payment_method').default('mock'), // for future: 'zarinpal', 'card', etc
    paidAt: timestamp('paid_at'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    userIdIdx: index('orders_user_id_idx').on(table.userId),
    statusIdx: index('orders_status_idx').on(table.status),
    createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
  }),
)

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}))

export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
