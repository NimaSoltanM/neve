import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateOrderStatus } from '../hooks/use-shop-orders'
import { useI18n } from '@/features/shared/i18n'
import type { Order } from '../schemas/order.schema'
import { Loader2 } from 'lucide-react'

interface ShopOrderStatusSelectProps {
  orderId: number
  currentStatus: Order['status']
}

export function ShopOrderStatusSelect({
  orderId,
  currentStatus,
}: ShopOrderStatusSelectProps) {
  const { t } = useI18n()
  const updateStatus = useUpdateOrderStatus()

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === currentStatus) return

    updateStatus.mutate({
      orderId,
      status: newStatus as 'paid' | 'completed' | 'cancelled',
    })
  }

  // Only paid orders can be marked as completed
  const availableStatuses =
    currentStatus === 'paid'
      ? ['paid', 'completed', 'cancelled']
      : [currentStatus]

  return (
    <Select
      value={currentStatus}
      onValueChange={handleStatusChange}
      disabled={
        updateStatus.isPending ||
        currentStatus === 'completed' ||
        currentStatus === 'cancelled'
      }
    >
      <SelectTrigger className="w-[140px] h-9">
        {updateStatus.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent>
        {availableStatuses.map((status) => (
          <SelectItem key={status} value={status}>
            {t(`shopOrders.${status}` as any)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
