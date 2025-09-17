import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useI18n } from '@/features/shared/i18n'
import { Store, CheckCircle, Calendar } from 'lucide-react'

interface ShopHeaderProps {
  shop: {
    id: number
    name: string
    slug: string
    description?: { en: string; fa: string } | null
    logo?: string | null
    banner?: string | null
    isActive: boolean
    isVerified: boolean
    createdAt: Date
    owner?: {
      id: string
      firstName: string | null
      lastName: string | null
    }
  }
}

export function ShopHeader({ shop }: ShopHeaderProps) {
  const { t, locale } = useI18n()

  const description =
    shop.description?.[locale as 'en' | 'fa'] || shop.description?.en
  const ownerName = shop.owner
    ? `${shop.owner.firstName || ''} ${shop.owner.lastName || ''}`.trim()
    : null

  return (
    <div>
      {/* Banner */}
      {shop.banner ? (
        <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden mb-6">
          <img
            src={shop.banner}
            alt={shop.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg mb-6" />
      )}

      {/* Shop Info Card */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <Avatar className="w-24 h-24">
            {shop.logo ? (
              <AvatarImage src={shop.logo} alt={shop.name} />
            ) : (
              <AvatarFallback>
                <Store className="w-12 h-12" />
              </AvatarFallback>
            )}
          </Avatar>

          {/* Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{shop.name}</h1>
              {shop.isVerified && (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {t('marketplace.verified')}
                </Badge>
              )}
            </div>

            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {ownerName && (
                <div className="flex items-center gap-1">
                  <Store className="w-4 h-4" />
                  {ownerName}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {t('marketplace.memberSince')}{' '}
                {new Date(shop.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
