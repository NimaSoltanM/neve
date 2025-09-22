import { createServerFn } from '@tanstack/react-start'
import db from '@/server/db'
import { sessions } from '../schemas/auth.schema'
import { eq } from 'drizzle-orm'
import { getCookie, deleteCookie } from '@tanstack/react-start/server'

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const sessionToken = getCookie('sessionToken')

  if (sessionToken) {
    await db.delete(sessions).where(eq(sessions.token, sessionToken))
  }

  // Remove cookie
  deleteCookie('sessionToken')

  return { success: true }
})
