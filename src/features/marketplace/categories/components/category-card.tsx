import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ChevronRight, Package, Home, Zap, Shirt } from 'lucide-react'
import { useI18n } from '@/features/shared/i18n'
import type { Category } from '../types'

interface CategoryCardProps {
  category: Category
}

// Only include icons you actually need
const ICONS: Record<string, any> = {
  Home,
  Shirt,
  Zap,
}

export function CategoryCard({ category }: CategoryCardProps) {
  const { locale } = useI18n()
  const name = category.name[locale as 'en' | 'fa'] || category.name.en

  const IconComponent =
    category.icon && ICONS[category.icon] ? ICONS[category.icon] : Package

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
          <IconComponent className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-semibold text-lg line-clamp-1">{name}</h3>
      </CardHeader>
      <CardContent>
        {category.children && category.children.length > 0 && (
          <div className="space-y-2">
            {category.children.slice(0, 3).map((child) => {
              const childName =
                child.name[locale as 'en' | 'fa'] || child.name.en
              return (
                <Link
                  key={child.id}
                  to="/categories/$slug"
                  params={{ slug: child.slug }}
                  search={{ page: 1 }}
                  className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="line-clamp-1">{childName}</span>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 rtl:rotate-180" />
                </Link>
              )
            })}
            {category.children.length > 3 && (
              <p className="text-xs text-muted-foreground pt-1">
                +{category.children.length - 3} more
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
