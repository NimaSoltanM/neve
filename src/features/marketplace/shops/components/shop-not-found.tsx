import { useI18n } from '@/features/shared/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Link, useRouter } from '@tanstack/react-router'
import {
  Store,
  AlertCircle,
  ArrowLeft,
  Search,
  Grid3x3,
  PowerOff,
  Trash2,
  LinkIcon,
} from 'lucide-react'

export function ShopNotFound() {
  const { t, dir } = useI18n()
  const router = useRouter()

  return (
    <div dir={dir} className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto space-y-6 py-12">
        {/* Icon and Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
              <div className="relative bg-background border-2 border-primary/20 rounded-full p-6">
                <Store className="h-16 w-16 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              {t('notFoundErrors.shopNotFound')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('notFoundErrors.shopNotFoundDesc')}
            </p>
          </div>
        </div>

        {/* Possible Reasons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t('notFoundErrors.shopMightBe')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert variant="default">
              <PowerOff className="h-4 w-4" />
              <AlertDescription>
                {t('notFoundErrors.shopInactive')}
              </AlertDescription>
            </Alert>

            <Alert variant="default">
              <Trash2 className="h-4 w-4" />
              <AlertDescription>
                {t('notFoundErrors.shopDeleted')}
              </AlertDescription>
            </Alert>

            <Alert variant="default">
              <LinkIcon className="h-4 w-4" />
              <AlertDescription>
                {t('notFoundErrors.shopUrlChanged')}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.history.back()}
          >
            <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
            {t('notFoundErrors.goBack')}
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link to="/shops" search={{ page: 1 }}>
              <Grid3x3 className="me-2 h-4 w-4" />
              {t('notFoundErrors.browseShops')}
            </Link>
          </Button>

          <Button variant="default" className="w-full" asChild>
            <Link to="/shops" search={{ page: 1 }}>
              <Search className="me-2 h-4 w-4" />
              {t('notFoundErrors.searchShops')}
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-muted-foreground">
          {t('common.siteName')} • {t('shops.allShops')}
        </p>
      </div>
    </div>
  )
}
