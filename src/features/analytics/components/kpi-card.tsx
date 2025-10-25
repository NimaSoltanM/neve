import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { useI18n } from '@/features/shared/i18n'

interface KPICardProps {
  title: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon?: LucideIcon
  isPrice?: boolean
}

export function KPICard({
  title,
  value,
  change,
  icon: Icon,
  isPrice = false,
}: KPICardProps) {
  const { t, locale } = useI18n()

  const displayValue = isPrice ? formatPrice(value, { locale }) : value

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayValue}</div>
        {change && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {change.trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span
              className={cn(
                'font-medium',
                change.trend === 'up' ? 'text-green-600' : 'text-red-600',
              )}
              dir="ltr"
            >
              {change.value > 0 ? '+' : ''}
              {change.value.toFixed(1)}%
            </span>
            <span className="ms-1">{t('analytics.vsPreviousPeriod')}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
