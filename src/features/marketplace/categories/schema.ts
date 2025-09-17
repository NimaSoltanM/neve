import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { products } from '../products/schema'

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1000 }),
  parentId: integer('parent_id').references((): AnyPgColumn => categories.id),
  slug: text('slug').notNull().unique(),
  name: jsonb('name').notNull().$type<{ en: string; fa: string }>(),
  icon: text('icon'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'CategoryToParent',
  }),
  children: many(categories, { relationName: 'CategoryToParent' }),

  products: many(products),
}))
