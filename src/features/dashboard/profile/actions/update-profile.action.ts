import { createServerFn } from '@tanstack/react-start'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import db from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { updateProfileSchema, type UpdateProfileInput } from '../schema'

export const updateProfile = createServerFn({ method: 'POST' })
  .validator((data: UpdateProfileInput) => {
    const validation = updateProfileSchema.safeParse(data)
    if (!validation.success) {
      throw new Error('validation error')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { isAuthenticated, user } = await getCurrentUser()

    if (!isAuthenticated || !user) {
      throw new Error('Unauthorized')
    }

    await db
      .update(users)
      .set({
        firstName: data.firstName,
        lastName: data.lastName,
        avatar: data.avatar || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return { success: true }
  })
