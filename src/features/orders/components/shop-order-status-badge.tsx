import { Badge } from '@/components/ui/badge'
import { useI18n } from '@/features/shared/i18n'
import type { Order } from '../schemas/order.schema'

interface ShopOrderStatusBadgeProps {
  status: Order['status']
}

const STATUS_STYLES = {
  pending:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  completed:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
  cancelled:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
}

export function ShopOrderStatusBadge({ status }: ShopOrderStatusBadgeProps) {
  const { t } = useI18n()

  return (
    <Badge
      variant="outline"
      className={`${STATUS_STYLES[status]} font-medium px-2.5 py-0.5`}
    >
      {t(`shopOrders.${status}`)}
    </Badge>
  )
}
