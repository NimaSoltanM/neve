import db from '@/server/db'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { and, eq, gte } from 'drizzle-orm'
import { otpCodes } from '../schemas/auth.schema'

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
      return {
        success: false,
        message: 'Please wait before requesting a new code',
      }
    }

    // Generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString()

    // Save OTP to database
    await db.insert(otpCodes).values({
      phoneNumber,
      code,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    })

    return {
      success: true,
      code,
    }
  })
