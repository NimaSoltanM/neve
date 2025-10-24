import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getShopOrders } from '../actions/get-shop-orders.action'
import { updateOrderStatus } from '../actions/update-order-status.action'
import { toast } from 'sonner'
import { useI18n } from '@/features/shared/i18n'

interface UseShopOrdersParams {
  page?: number
  limit?: number
  status?: 'pending' | 'paid' | 'completed' | 'cancelled'
}

export function useShopOrders(params: UseShopOrdersParams = {}) {
  const { t } = useI18n()
  const { page = 1, limit = 20, status } = params

  return useQuery({
    queryKey: ['shop-orders', { page, limit, status }],
    queryFn: async () => {
      const result = await getShopOrders({ data: { page, limit, status } })

      if (!result.success) {
        toast.error(t(result.errorKey as any))
        return {
          orders: [],
          pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        }
      }

      return result
    },
  })
}

export function useUpdateOrderStatus() {
  const { t } = useI18n()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      orderId: number
      status: 'paid' | 'completed' | 'cancelled'
    }) => {
      return await updateOrderStatus({ data })
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('shopOrders.updateSuccess'))
        queryClient.invalidateQueries({ queryKey: ['shop-orders'] })
      } else {
        toast.error(t(result.errorKey as any))
      }
    },
    onError: () => {
      toast.error(t('shopOrders.updateError'))
    },
  })
}
