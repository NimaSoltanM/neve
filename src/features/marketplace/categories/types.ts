export interface Category {
  id: number
  parentId: number | null
  slug: string
  name: {
    en: string
    fa: string
  }
  icon: string | null
  isActive: boolean
  createdAt: Date
  children?: Category[]
  parent?: Category
}
