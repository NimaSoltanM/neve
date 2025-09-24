import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { notifications } from '../schemas/notification.schema'
import { z } from 'zod'

const batchCreateSchema = z.object({
  notifications: z.array(
    z.object({
      userId: z.string(),
      type: z.string(),
      title: z.string(),
      message: z.string(),
      metadata: z.record(z.any(), z.any()).optional(),
      actionUrl: z.string().optional(),
      groupKey: z.string().optional(),
      priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
      expiresAt: z.date().optional(),
    }),
  ),
})

export const createBatchNotifications = createServerFn()
  .validator((data: unknown) => batchCreateSchema.parse(data))
  .handler(async ({ data }) => {
    const created = await db
      .insert(notifications)
      .values(data.notifications)
      .returning()

    return created
  })
