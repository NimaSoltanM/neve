// src/features/shared/upload/actions/upload-file.action.ts
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '@/features/auth/middleware/auth.middleware'
import { files } from '../schemas/file.schema'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import type { UploadedFile } from '../types/upload.types'
import db from '@/server/db'

export const uploadFile = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator((formData: FormData) => {
    const file = formData.get('file') as File
    const category = (formData.get('category') as string) || 'general'

    if (!file || !(file instanceof File)) {
      throw new Error('No file provided')
    }

    return { file, category }
  })
  .handler(async ({ data, context }) => {
    const { file, category } = data
    const userId = context.user.id

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${ext}`

    // Create upload directory if doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', category)
    await mkdir(uploadDir, { recursive: true })

    // Convert File to Buffer and save
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // Save to database
    const [savedFile] = await db
      .insert(files)
      .values({
        originalName: file.name,
        fileName,
        mimeType: file.type,
        size: file.size,
        url: `/uploads/${category}/${fileName}`,
        uploadedBy: userId,
        category,
      })
      .returning()

    const result: UploadedFile = {
      id: savedFile.id,
      url: savedFile.url,
      name: savedFile.originalName,
      size: savedFile.size,
      type: savedFile.mimeType,
    }

    return result
  })
