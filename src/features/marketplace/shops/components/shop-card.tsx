import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n'
import { Store, Package, CheckCircle, ArrowRight } from 'lucide-react'

type ShopCardProps = {
  shop: {
    id: number
    name: string
    slug: string
    description: { en: string; fa: string } | null
    logo: string | null
    banner: string | null
    isVerified: boolean
    productCount: number
    createdAt: Date
  }
}

export function ShopCard({ shop }: ShopCardProps) {
  const { t, locale } = useI18n()

  const shopDescription = shop.description
    ? shop.description[locale] || shop.description.en
    : null

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
        {shop.banner ? (
          <img
            src={shop.banner}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Store className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-8 start-6">
          <div className="w-16 h-16 rounded-full border-4 border-background bg-background shadow-lg overflow-hidden">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/20">
                <Store className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
        </div>

        {shop.isVerified && (
          <Badge className="absolute top-3 end-3 bg-blue-500">
            <CheckCircle className="me-1 h-3 w-3" />
            {t('shops.verified')}
          </Badge>
        )}
      </div>

      <CardContent className="pt-12 pb-6 space-y-4">
        {/* Shop Name */}
        <div>
          <h3 className="text-xl font-semibold truncate group-hover:text-primary transition-colors">
            {shop.name}
          </h3>
          {shopDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {shopDescription}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>
            {shop.productCount} {t('shops.products')}
          </span>
        </div>

        {/* View Button */}
        <Button className="w-full group-hover:bg-primary" asChild>
          <Link
            to="/shops/$slug"
            params={{ slug: shop.slug }}
            search={{ page: 1 }}
          >
            {t('shops.viewShop')}
            <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
