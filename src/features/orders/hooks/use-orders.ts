import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserOrders } from '../actions/get-user-orders.action'
import { getOrderDetails } from '../actions/get-order-details.action'
import { createOrder } from '../actions/create-order.action'
import { processPayment } from '../actions/process-payment.action'
import { cancelOrder } from '../actions/cancel-order.action'
import type { CreateOrderInput } from '../types/order.types'
import { useCart } from '@/features/cart/hooks/use-cart'
import { toast } from 'sonner'
import { useNavigate } from '@tanstack/react-router'

export function useOrders(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => getUserOrders({ data: { page, limit } }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useOrderDetails(orderId: number | null) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => (orderId ? getOrderDetails({ data: { orderId } }) : null),
    enabled: !!orderId,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  return useMutation({
    mutationFn: (data: CreateOrderInput) => createOrder({ data }),
    onSuccess: async (result) => {
      // Clear cart state (server already cleared it)
      await clearCart()

      // Invalidate orders query
      await queryClient.invalidateQueries({ queryKey: ['orders'] })

      // Navigate to order success page
      await navigate({
        to: '/dashboard/orders/$orderId',
        params: { orderId: result.orderId.toString() },
      })

      toast.success('Order created successfully!')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order')
    },
  })
}

export function useProcessPayment() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (orderId: number) => processPayment({ data: { orderId } }),
    onSuccess: async (result) => {
      // Invalidate order queries
      await queryClient.invalidateQueries({
        queryKey: ['order', result.order.id],
      })
      await queryClient.invalidateQueries({ queryKey: ['orders'] })

      // Show success message
      toast.success('Payment successful! Your order is confirmed.')

      // Navigate to order confirmation
      await navigate({
        to: '/dashboard/orders/$orderId/success',
        params: { orderId: result.order.id.toString() },
      })
    },
    onError: (error) => {
      toast.error(error.message || 'Payment failed')
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderId: number) => cancelOrder({ data: { orderId } }),
    onSuccess: async (_, orderId) => {
      await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast.success('Order cancelled successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel order')
    },
  })
}
