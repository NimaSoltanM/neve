import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { notifications } from '../schemas/notification.schema'
import { eq, and, inArray } from 'drizzle-orm'
import { z } from 'zod'

const markReadSchema = z.object({
  notificationIds: z.array(z.number()),
})

export const markAsRead = createServerFn()
  .middleware([authMiddleware])
  .validator((data: unknown) => markReadSchema.parse(data))
  .handler(async ({ context, data }) => {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, context.user.id),
          inArray(notifications.id, data.notificationIds),
        ),
      )

    return { success: true }
  })

export const markAllAsRead = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, context.user.id),
          eq(notifications.isRead, false),
        ),
      )

    return { success: true }
  })
