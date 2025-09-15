import { pgTable, text, integer, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from '@/features/auth/schemas/auth.schema'

export const files = pgTable('files', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  originalName: text('original_name').notNull(),
  fileName: text('file_name').notNull(), // unique stored name
  mimeType: varchar('mime_type', { length: 255 }).notNull(),
  size: integer('size').notNull(), // in bytes
  url: text('url').notNull(), // public URL or path
  uploadedBy: text('uploaded_by').references(() => users.id, {
    onDelete: 'cascade',
  }),
  category: varchar('category', { length: 50 }), // 'product', 'shop_logo', 'avatar', etc.
  metadata: text('metadata'), // JSON string for extra data

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type File = typeof files.$inferSelect
export type NewFile = typeof files.$inferInsert
