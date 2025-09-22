import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import db from '@/server/db'
import { users, sessions } from '../schemas/auth.schema'
import { eq, and, gte } from 'drizzle-orm'
import { getCookie } from '@tanstack/react-start/server'

const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
})

export const updateProfile = createServerFn({ method: 'POST' })
  .validator(updateProfileSchema)
  .handler(async ({ data }) => {
    const sessionToken = getCookie('sessionToken')

    if (!sessionToken) {
      throw new Error('Not authenticated')
    }

    const session = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .where(
        and(
          eq(sessions.token, sessionToken),
          gte(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1)

    if (session.length === 0) {
      throw new Error('Invalid or expired session')
    }

    const { firstName, lastName } = data

    const updatedUser = await db
      .update(users)
      .set({
        firstName,
        lastName,
      })
      .where(eq(users.id, session[0].userId))
      .returning()

    if (updatedUser.length === 0) {
      throw new Error('User not found')
    }

    return {
      success: true,
      user: updatedUser[0],
    }
  })
