import type { Order } from '../schemas/order.schema'
import type { OrderItem } from '../schemas/order-item.schema'

// Local type definitions to avoid cross-feature imports
export interface ProductSnapshot {
  id: number
  name: string
  slug: string
  images: string[]
  type: 'regular' | 'auction'
  price?: string | null
  currentBid?: string | null
}

export interface ShopSnapshot {
  id: number
  name: string
  slug: string
}

export interface OrderWithItems extends Order {
  items: OrderItemWithDetails[]
}

export interface OrderItemWithDetails extends OrderItem {
  product: ProductSnapshot
  shop: ShopSnapshot
}

export interface OrderSummary {
  orderId: number
  totalAmount: string
  itemCount: number
  status: Order['status']
  createdAt: Date
  paidAt?: Date | null
}

export interface ShippingAddress {
  fullName: string
  phoneNumber: string
  address: string
  city: string
  postalCode: string
}

export interface CreateOrderInput {
  shippingAddress: ShippingAddress
}

export interface OrdersListResponse {
  orders: OrderWithItems[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface PaymentResponse {
  success: boolean
  order: Order
  message: string
  transactionId?: string // For real payment gateway
  gatewayResponse?: unknown // Raw gateway response for debugging
}

export interface OrderStatusUpdate {
  orderId: number
  status: Order['status']
  note?: string
}

// For checkout flow
export interface CheckoutData {
  shippingAddress: ShippingAddress
  paymentMethod?: string
  notes?: string
}

// Order status badges
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: { en: 'Pending', fa: 'در انتظار' },
    color: 'bg-yellow-100 text-yellow-800',
  },
  paid: {
    label: { en: 'Paid', fa: 'پرداخت شده' },
    color: 'bg-blue-100 text-blue-800',
  },
  completed: {
    label: { en: 'Completed', fa: 'تکمیل شده' },
    color: 'bg-green-100 text-green-800',
  },
  cancelled: {
    label: { en: 'Cancelled', fa: 'لغو شده' },
    color: 'bg-red-100 text-red-800',
  },
} as const
