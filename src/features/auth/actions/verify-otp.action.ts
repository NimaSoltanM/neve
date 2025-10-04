// src/features/auth/actions/verify-otp.action.ts
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import db from '@/server/db'
import { users, otpCodes, sessions } from '../schemas/auth.schema'
import { eq, and, gte } from 'drizzle-orm'
import { setCookie } from '@tanstack/react-start/server'

const verifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/, 'Invalid Iranian phone number format')
    .transform((val) => val.replace(/^0/, '+98')),
  code: z.string().length(5, 'Code must be 5 digits'),
})

export const verifyOtp = createServerFn({ method: 'POST' })
  .validator(verifyOtpSchema)
  .handler(async ({ data }) => {
    const { phoneNumber, code } = data

    // Find valid OTP (removed attempt check)
    const validOtp = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phoneNumber, phoneNumber),
          eq(otpCodes.code, code),
          gte(otpCodes.expiresAt, new Date()),
        ),
      )
      .limit(1)

    if (validOtp.length === 0) {
      return {
        success: false as const,
        errorKey: 'auth.invalidOtp' as const,
      }
    }

    // Check if user exists
    let user = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1)

    const isNewUser = user.length === 0
    const needsProfile = isNewUser || !user[0]?.firstName || !user[0]?.lastName

    if (isNewUser) {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          phoneNumber,
          isPhoneVerified: true,
        })
        .returning()

      user = newUser
    }

    // Delete used OTP
    await db.delete(otpCodes).where(eq(otpCodes.id, validOtp[0].id))

    // Create session
    const session = await db
      .insert(sessions)
      .values({
        userId: user[0].id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      })
      .returning()

    setCookie('sessionToken', session[0].token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return {
      success: true as const,
      needsProfile,
      userId: user[0].id,
    }
  })
