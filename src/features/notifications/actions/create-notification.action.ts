import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { notifications } from '../schemas/notification.schema'
import { z } from 'zod'

const createNotificationSchema = z.object({
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  icon: z.string().optional(),
  metadata: z.record(z.any(), z.any()).optional(),
  actionUrl: z.string().optional(),
  groupKey: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  expiresAt: z.date().optional(),
})

export const createNotification = createServerFn()
  .validator((data: unknown) => createNotificationSchema.parse(data))
  .handler(async ({ data }) => {
    const [notification] = await db
      .insert(notifications)
      .values(data)
      .returning()

    return notification
  })
