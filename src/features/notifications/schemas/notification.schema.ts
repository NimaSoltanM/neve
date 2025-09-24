import {
  pgTable,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
} from 'drizzle-orm/pg-core'

export const notifications = pgTable('notifications', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity({ startWith: 1 }),

  // Who gets this notification
  userId: text('user_id').notNull(), // No FK - the consuming app handles user validation

  // Notification type (string so any app can use any type)
  type: text('type').notNull(), // 'bid.outbid', 'order.shipped', 'system.maintenance', etc.

  // Display content
  title: text('title').notNull(),
  message: text('message').notNull(),
  icon: text('icon'), // Optional icon identifier/URL

  // Generic metadata - the app decides what to store
  metadata: jsonb('metadata').$type<Record<string, any>>(),

  // Where to navigate when clicked (optional)
  actionUrl: text('action_url'),

  // Grouping (for collapsing similar notifications)
  groupKey: text('group_key'), // e.g., 'auction-123' to group all bids for same auction

  // Priority/severity
  priority: text('priority').notNull().default('normal'), // 'low', 'normal', 'high', 'urgent'

  // Status
  isRead: boolean('is_read').notNull().default(false),
  readAt: timestamp('read_at'),

  // Auto-cleanup
  expiresAt: timestamp('expires_at'),

  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
})
