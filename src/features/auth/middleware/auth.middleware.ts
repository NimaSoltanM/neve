import { createMiddleware } from '@tanstack/react-start'
import db from '@/server/db'
import { sessions, users } from '../schemas/auth.schema'
import { eq, and, gte } from 'drizzle-orm'
import { getCookie } from '@tanstack/react-start/server'

// Middleware to check if user is authenticated and has complete profile
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const sessionToken = getCookie('sessionToken')

    if (!sessionToken) {
      throw new Error('Not authenticated')
    }

    // Get user from session
    const result = await db
      .select({
        id: users.id,
        phoneNumber: users.phoneNumber,
        firstName: users.firstName,
        lastName: users.lastName,
        isPhoneVerified: users.isPhoneVerified,
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
      throw new Error('Invalid or expired session')
    }

    const user = result[0]

    // Check if profile is complete
    if (!user.firstName || !user.lastName) {
      throw new Error('Profile incomplete')
    }

    // Pass user to the next middleware/handler
    return next({
      context: {
        user,
      },
    })
  },
)
