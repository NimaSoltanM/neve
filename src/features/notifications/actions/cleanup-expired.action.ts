import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { notifications } from '../schemas/notification.schema'
import { lt, isNotNull, and } from 'drizzle-orm'

export const cleanupExpiredNotifications = createServerFn().handler(
  async () => {
    const now = new Date()

    const deleted = await db
      .delete(notifications)
      .where(
        and(
          isNotNull(notifications.expiresAt),
          lt(notifications.expiresAt, now),
        ),
      )
      .returning({ id: notifications.id })

    return { deletedCount: deleted.length }
  },
)
