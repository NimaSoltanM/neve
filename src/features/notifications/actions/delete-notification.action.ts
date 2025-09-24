import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import db from '@/server/db'
import { notifications } from '../schemas/notification.schema'
import { eq, and, inArray } from 'drizzle-orm'
import { z } from 'zod'

const deleteSchema = z.object({
  notificationIds: z.array(z.number()),
})

export const deleteNotifications = createServerFn()
  .middleware([authMiddleware])
  .validator((data: unknown) => deleteSchema.parse(data))
  .handler(async ({ context, data }) => {
    await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.userId, context.user.id),
          inArray(notifications.id, data.notificationIds),
        ),
      )

    return { success: true }
  })

export const clearAllNotifications = createServerFn()
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await db
      .delete(notifications)
      .where(eq(notifications.userId, context.user.id))

    return { success: true }
  })
