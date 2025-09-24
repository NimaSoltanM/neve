import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { notifications } from '../schemas/notification.schema'
import { eq, desc, and, isNull, or, gte, sql } from 'drizzle-orm'

export const getUserNotifications = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const now = new Date()

    const userNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, context.user.id),
          or(
            isNull(notifications.expiresAt),
            gte(notifications.expiresAt, now),
          ),
        ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50)

    return userNotifications
  })

export const getUnreadCount = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const now = new Date()

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, context.user.id),
          eq(notifications.isRead, false),
          or(
            isNull(notifications.expiresAt),
            gte(notifications.expiresAt, now),
          ),
        ),
      )

    return result[0]?.count || 0
  })

export const getRecentNotifications = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const now = new Date()

    const recent = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, context.user.id),
          or(
            isNull(notifications.expiresAt),
            gte(notifications.expiresAt, now),
          ),
        ),
      )
      .orderBy(desc(notifications.createdAt))
      .limit(3)

    return recent
  })
