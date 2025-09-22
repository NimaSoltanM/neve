import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import db from '@/server/db'
import { otpCodes } from '../schemas/auth.schema'
import { and, eq, gte } from 'drizzle-orm'

const sendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^09\d{9}$/, 'Invalid Iranian phone number format')
    .transform((val) => val.replace(/^0/, '+98')),
})

export const sendOtp = createServerFn({ method: 'POST' })
  .validator(sendOtpSchema)
  .handler(async ({ data }) => {
    const { phoneNumber } = data

    // Check for recent OTP (prevent spam)
    const recentOtp = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phoneNumber, phoneNumber),
          gte(otpCodes.expiresAt, new Date()),
        ),
      )
      .limit(1)

    if (recentOtp.length > 0) {
      throw new Error('Please wait before requesting a new code')
    }

    // Generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString()

    // Save OTP to database
    await db.insert(otpCodes).values({
      phoneNumber,
      code,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000), // 2 minutes
    })

    // TODO: Send SMS via provider
    // For development, return the code to display in toast
    return {
      success: true,
      code: process.env.NODE_ENV === 'development' ? code : undefined,
    }
  })
