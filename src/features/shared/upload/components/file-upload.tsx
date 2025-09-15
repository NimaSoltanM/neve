// src/features/shared/upload/components/file-upload.tsx
import { useCallback, useState } from 'react'
import {
  Upload,
  X,
  FileIcon,
  Loader2,
  Image as ImageIcon,
  FileText,
  File,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useI18n } from '@/features/shared/i18n'
import { uploadFile } from '../actions/upload-file.action'
import { deleteFile } from '../actions/delete-file.action'
import type { FileUploadProps } from '../types/upload.types'

// Helper to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Get icon based on file type
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType.includes('pdf')) return FileText
  return File
}

export function FileUpload({
  accept = 'image/*',
  maxSize = 5,
  multiple = false,
  value,
  onChange,
  disabled = false,
  category = 'general',
}: FileUploadProps) {
  const { dir } = useI18n()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      setError(null)

      if (disabled || uploading) return

      const files = Array.from(e.dataTransfer.files)
      await handleFiles(files)
    },
    [disabled, uploading],
  )

  const handleFiles = async (files: File[]) => {
    if (!files.length) return

    // Validate file types
    const acceptedTypes = accept.split(',').map((t) => t.trim())
    const invalidFiles = files.filter((file) => {
      const isValid = acceptedTypes.some((type) => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0]
          return file.type.startsWith(baseType + '/')
        }
        return file.type === type || file.name.endsWith(type)
      })
      return !isValid
    })

    if (invalidFiles.length > 0) {
      setError(`Invalid file type: ${invalidFiles[0].name}`)
      return
    }

    // Validate file sizes
    const oversizedFiles = files.filter(
      (file) => file.size > maxSize * 1024 * 1024,
    )
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles[0].name} is too large (max ${maxSize}MB)`)
      return
    }

    // Check multiple files limit
    if (!multiple && files.length > 1) {
      setError('Only one file allowed')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const totalFiles = files.length
      let completed = 0

      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('category', category)

        const result = await uploadFile({ data: formData })
        completed++
        setUploadProgress(Math.round((completed / totalFiles) * 100))
        return result
      })

      const uploaded = await Promise.all(uploadPromises)

      if (multiple) {
        const existing = Array.isArray(value) ? value : []
        onChange?.([...existing, ...uploaded])
      } else {
        onChange?.(uploaded[0])
      }

      // Show success briefly
      setUploadProgress(100)
      setTimeout(() => setUploadProgress(0), 1000)
    } catch (error) {
      console.error('Upload failed:', error)
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = async (fileId: string) => {
    setDeleting(fileId)
    setError(null)

    try {
      await deleteFile({ data: { fileId } })

      if (Array.isArray(value)) {
        onChange?.(value.filter((f) => f.id !== fileId))
      } else {
        onChange?.(null)
      }
    } catch (error) {
      console.error('Delete failed:', error)
      setError('Failed to delete file')
    } finally {
      setDeleting(null)
    }
  }

  const currentFiles = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          if (e.currentTarget === e.target) setDragActive(false)
        }}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200',
          dragActive && 'border-primary bg-primary/5 scale-[1.02]',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive',
          !dragActive &&
            !error &&
            'border-muted-foreground/25 hover:border-muted-foreground/50',
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || uploading}
          onChange={(e) => {
            setError(null)
            handleFiles(Array.from(e.target.files || []))
          }}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className={cn(
            'block p-8 cursor-pointer',
            (disabled || uploading) && 'cursor-not-allowed',
          )}
        >
          <div className="flex flex-col items-center justify-center text-center">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-sm font-medium">Uploading...</p>
                {uploadProgress > 0 && (
                  <Progress value={uploadProgress} className="w-32 mt-2 h-2" />
                )}
              </>
            ) : dragActive ? (
              <>
                <Upload className="h-10 w-10 text-primary mb-3 animate-pulse" />
                <p className="text-sm font-medium">Drop files here</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium text-foreground">
                  Drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {accept === 'image/*' && 'PNG, JPG, GIF up to '}
                  {accept === '.pdf' && 'PDF files up to '}
                  {accept.includes('*') === false &&
                    accept.includes('.') === false &&
                    `${accept} files up to `}
                  {maxSize}MB
                </p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* File List */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {multiple
              ? `${currentFiles.length} file(s) uploaded`
              : 'Uploaded file'}
          </p>

          {currentFiles.map((file) => {
            const FileIconComponent = getFileIcon(file.type)
            const isImage = file.type.startsWith('image/')

            return (
              <div
                key={file.id}
                className={cn(
                  'group flex items-center gap-3 p-3 border rounded-lg transition-colors',
                  deleting === file.id && 'opacity-50',
                  !deleting && 'hover:bg-muted/50',
                )}
                dir={dir}
              >
                {/* File Preview/Icon */}
                <div className="shrink-0">
                  {isImage ? (
                    <div className="relative h-12 w-12 rounded overflow-hidden bg-muted">
                      <img
                        src={file.url}
                        alt={file.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <FileIconComponent className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Success/Delete */}
                <div className="shrink-0 flex items-center gap-2">
                  {!deleting && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                    disabled={disabled || deleting === file.id}
                  >
                    {deleting === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
