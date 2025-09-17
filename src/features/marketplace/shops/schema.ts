import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '@/server/db/schema'
import { products } from '../products/schema'

export const shops = pgTable('shops', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: jsonb('description').$type<{ en: string; fa: string }>(),
  logo: text('logo'), // from file upload
  banner: text('banner'), // from file upload
  isActive: boolean('is_active').notNull().default(false), // admin approval needed
  isVerified: boolean('is_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const shopsRelations = relations(shops, ({ one, many }) => ({
  owner: one(users, {
    fields: [shops.userId],
    references: [users.id],
  }),
  products: many(products),
}))
