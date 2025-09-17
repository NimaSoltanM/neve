import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useI18n } from '@/features/shared/i18n'
import { ChevronRight, Package } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface CategoryHeaderProps {
  category: {
    id: number
    name: { en: string; fa: string }
    slug: string
    icon?: string | null
    parent?: {
      id: number
      name: { en: string; fa: string }
      slug: string
    } | null
    children?: Array<{
      id: number
      name: { en: string; fa: string }
      slug: string
    }>
  }
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  const { t, locale } = useI18n()

  const categoryName = category.name[locale as 'en' | 'fa'] || category.name.en
  const parentName =
    category.parent?.name[locale as 'en' | 'fa'] || category.parent?.name.en

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">{t('nav.home')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </BreadcrumbSeparator>

          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/categories">{t('marketplace.categories')}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          {category.parent && (
            <>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/categories/$slug"
                    params={{ slug: category.parent.slug }}
                  >
                    {parentName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}

          <BreadcrumbSeparator>
            <ChevronRight className="h-4 w-4 rtl:rotate-180" />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Category Title */}
      <div className="flex items-center gap-4">
        {category.icon ? (
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <img src={category.icon} alt={categoryName} className="w-8 h-8" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-primary" />
          </div>
        )}
        <h1 className="text-3xl font-bold">{categoryName}</h1>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {category.children.map((child) => {
            const childName = child.name[locale as 'en' | 'fa'] || child.name.en
            return (
              <Link
                key={child.id}
                to="/categories/$slug"
                params={{ slug: child.slug }}
              >
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80"
                >
                  {childName}
                </Badge>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
