export interface UploadedFile {
  id: string
  url: string
  name: string
  size: number
  type: string
}

export interface FileUploadProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  value?: UploadedFile | UploadedFile[] | null
  onChange?: (files: UploadedFile | UploadedFile[] | null) => void
  disabled?: boolean
  category?: string
}
