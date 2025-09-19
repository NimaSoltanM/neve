import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { LocalCartItem, CartItemWithProduct } from '../schemas/cart.schema'

// Local cart for non-authenticated users (persisted in localStorage)
export const localCartAtom = atomWithStorage<LocalCartItem[]>('local-cart', [])

// Local cart products info (fetched separately for guest users)
export const localCartProductsAtom = atom<Record<number, any>>({})

// Server cart for authenticated users (from database)
export const serverCartAtom = atom<CartItemWithProduct[]>([])

// Combined cart - merges local cart with product info or returns server cart
export const cartAtom = atom<CartItemWithProduct[]>((get) => {
  const serverCart = get(serverCartAtom)
  const localCart = get(localCartAtom)
  const localProducts = get(localCartProductsAtom)

  // If we have server cart, return it
  if (serverCart.length > 0) {
    return serverCart
  }

  // Convert local cart to CartItemWithProduct format with fetched product data
  return localCart.map((item) => {
    const product = localProducts[item.productId]

    return {
      id: 0, // Temporary ID for local items
      cartId: 0,
      productId: item.productId,
      quantity: item.quantity,
      priceAtAdd: product?.price || '0',
      bidAmount: item.bidAmount || null,
      addedAt: new Date(item.addedAt),
      updatedAt: new Date(item.addedAt),
      product: product
        ? {
            id: product.id,
            name: product.name,
            slug: product.slug,
            type: product.type,
            price: product.price,
            images: product.images || [],
            stock: product.stock,
            isActive: product.isActive,
            currentBid: product.currentBid,
            auctionEndsAt: product.auctionEndsAt,
          }
        : {
            id: item.productId,
            name: 'Loading...',
            slug: '',
            type: 'regular' as const,
            price: null,
            images: [],
            stock: null,
            isActive: true,
            currentBid: null,
            auctionEndsAt: null,
          },
    }
  })
})

// Loading states
export const isCartLoadingAtom = atom(false)
export const isSyncingAtom = atom(false)

// Derived atoms
export const cartItemCountAtom = atom((get) => {
  const serverCart = get(serverCartAtom)
  const localCart = get(localCartAtom)

  // Use server cart if available, otherwise local
  const items = serverCart.length > 0 ? serverCart : localCart
  return items.reduce((sum, item) => sum + item.quantity, 0)
})

export const cartTotalAtom = atom((get) => {
  const items = get(cartAtom)
  return items.reduce((total, item) => {
    // For auction items with bid
    if (item.product.type === 'auction' && item.bidAmount) {
      return total + parseFloat(item.bidAmount)
    }
    // For regular items
    if (item.product.price) {
      return total + parseFloat(item.product.price) * item.quantity
    }
    return total
  }, 0)
})

// Check if specific product is in cart
export const isInCartAtom = atom((get) => (productId: number) => {
  const localItems = get(localCartAtom)
  const serverItems = get(serverCartAtom)

  // Check server cart first if available
  if (serverItems.length > 0) {
    return serverItems.some((item) => item.productId === productId)
  }

  // Otherwise check local cart
  return localItems.some((item) => item.productId === productId)
})

// Get specific item from cart
export const getCartItemAtom = atom((get) => (productId: number) => {
  const items = get(cartAtom)
  return items.find((item) => item.productId === productId)
})

// Cart has items check
export const hasItemsAtom = atom((get) => {
  const count = get(cartItemCountAtom)
  return count > 0
})

// Out of stock items check
export const outOfStockItemsAtom = atom((get) => {
  const items = get(cartAtom)
  return items.filter(
    (item) =>
      item.product.type === 'regular' &&
      (item.product.stock === 0 || !item.product.isActive),
  )
})

// Price changed items (comparing priceAtAdd with current price)
export const priceChangedItemsAtom = atom((get) => {
  const items = get(cartAtom)
  return items.filter((item) => {
    if (
      item.product.type === 'regular' &&
      item.product.price &&
      item.priceAtAdd
    ) {
      return item.product.price !== item.priceAtAdd
    }
    return false
  })
})

// Cart validation state
export const cartValidationAtom = atom((get) => {
  const outOfStock = get(outOfStockItemsAtom)
  const priceChanged = get(priceChangedItemsAtom)

  return {
    isValid: outOfStock.length === 0,
    hasWarnings: priceChanged.length > 0,
    outOfStockItems: outOfStock,
    priceChangedItems: priceChanged,
  }
})
