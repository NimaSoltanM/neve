// src/features/shared/upload/actions/delete-file.action.ts
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import { files } from '../schemas/file.schema'
import { eq, and } from 'drizzle-orm'
import { unlink } from 'fs/promises'
import { join } from 'path'
import db from '@/server/db'

export const deleteFile = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((input: { fileId: string }) => input)
  .handler(async ({ data, context }) => {
    const { fileId } = data
    const userId = context.user.id

    // Get file from database
    const [file] = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.id, fileId),
          eq(files.uploadedBy, userId), // Only owner can delete
        ),
      )

    if (!file) {
      throw new Error('File not found or unauthorized')
    }

    // Delete physical file
    try {
      const filePath = join(process.cwd(), 'public', file.url)
      await unlink(filePath)
    } catch (error) {
      console.error('Failed to delete physical file:', error)
    }

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId))

    return { success: true }
  })
