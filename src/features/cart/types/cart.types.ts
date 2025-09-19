import { CartItemWithProduct } from '../schemas/cart.schema'

export interface AddToCartParams {
  productId: number
  quantity?: number
  bidAmount?: string // For auction products
}

export interface UpdateCartItemParams {
  productId: number
  quantity?: number
  bidAmount?: string
}

export interface CartSyncResult {
  success: boolean
  mergedCount: number
  conflicts: Array<{
    productId: number
    reason: 'out_of_stock' | 'price_changed' | 'auction_ended'
  }>
}

export interface CartNotification {
  type: 'success' | 'warning' | 'error'
  message: string
  productId?: number
}

// Cart operations response types
export interface CartOperationResult {
  success: boolean
  message?: string
  cart?: CartItemWithProduct[]
}
