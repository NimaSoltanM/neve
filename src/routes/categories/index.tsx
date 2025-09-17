import { createFileRoute, Await } from '@tanstack/react-router'
import { getCategories } from '@/features/marketplace/categories/actions'
import { CategoryGrid } from '@/features/marketplace/categories/components/category-grid'
import { CategoryGridSkeleton } from '@/features/marketplace/categories/components/category-grid-skeleton'
import { useI18n } from '@/features/shared/i18n'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import TestSlider from '@/components/ui/test-slider'

export const Route = createFileRoute('/categories/')({
  loader: async () => {
    const categoriesPromise = getCategories()
    return { categoriesPromise }
  },
  component: CategoriesPage,
})

function CategoriesPage() {
  const { categoriesPromise } = Route.useLoaderData()
  const { t, dir } = useI18n()

  return (
    <div dir={dir} className="container mx-auto p-6">
      <TestSlider />
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
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
            <BreadcrumbPage>{t('marketplace.categories')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-8">
        {t('marketplace.allCategories')}
      </h1>

      <Await promise={categoriesPromise} fallback={<CategoryGridSkeleton />}>
        {(result) => {
          if (!result || result.length === 0) {
            return (
              <div className="text-center py-12 text-muted-foreground">
                {t('marketplace.noCategoriesFound')}
              </div>
            )
          }
          return <CategoryGrid categories={result} />
        }}
      </Await>
    </div>
  )
}
