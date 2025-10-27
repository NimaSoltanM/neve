import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { users, sessions } from '../schemas/auth.schema'
import { eq, and, gte } from 'drizzle-orm'
import { getCookie } from '@tanstack/react-start/server'

export const getCurrentUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const sessionToken = getCookie('sessionToken')

    if (!sessionToken) {
      return { user: null, isAuthenticated: false }
    }

    // Join sessions with users
    const result = await db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
        firstName: users.firstName,
        lastName: users.lastName,
        avatar: users.avatar,
        isPhoneVerified: users.isPhoneVerified,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.token, sessionToken),
          gte(sessions.expiresAt, new Date()),
        ),
      )
      .limit(1)

    if (result.length === 0) {
      return { user: null, isAuthenticated: false }
    }

    const needsProfile = !result[0].firstName || !result[0].lastName

    return {
      user: result[0],
      isAuthenticated: true,
      needsProfile,
    }
  },
)
