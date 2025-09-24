import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect } from 'react'
import {
  localCartAtom,
  localCartProductsAtom,
  serverCartAtom,
  cartAtom,
  cartItemCountAtom,
  cartTotalAtom,
  isCartLoadingAtom,
  isSyncingAtom,
  isInCartAtom,
  getCartItemAtom,
  hasItemsAtom,
  cartValidationAtom,
} from '../atoms/cart.atom'
import type { AddToCartParams, UpdateCartItemParams } from '../types/cart.types'
import type { LocalCartItem } from '../schemas/cart.schema'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { getUserCart } from '../actions/get-cart.action'
import { getProductsByIds } from '../actions/get-products-by-ids.action'
import { addToCart as addToCartAction } from '../actions/add-to-cart.action'
import { updateCartItem as updateCartItemAction } from '../actions/update-cart-item.action'
import { removeFromCart as removeFromCartAction } from '../actions/remove-from-cart.action'
import { clearCart as clearCartAction } from '../actions/clear-cart.action'
import { syncCart as syncCartAction } from '../actions/sync-cart.action'

export function useCart() {
  const { isAuthenticated, user } = useAuth()
  const [localCart, setLocalCart] = useAtom(localCartAtom)
  const [localCartProducts, setLocalCartProducts] = useAtom(
    localCartProductsAtom,
  )
  const [setServerCart] = useAtom(serverCartAtom)
  const cart = useAtomValue(cartAtom)
  const itemCount = useAtomValue(cartItemCountAtom)
  const total = useAtomValue(cartTotalAtom)
  const [isLoading, setIsLoading] = useAtom(isCartLoadingAtom)
  const [isSyncing, setIsSyncing] = useAtom(isSyncingAtom)
  const isInCart = useAtomValue(isInCartAtom)
  const getCartItem = useAtomValue(getCartItemAtom)
  const hasItems = useAtomValue(hasItemsAtom)
  const validation = useAtomValue(cartValidationAtom)

  // Load product details for local cart items
  useEffect(() => {
    if (!isAuthenticated && localCart.length > 0) {
      loadLocalCartProducts()
    }
  }, [localCart, isAuthenticated])

  // Load server cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadServerCart()
    }
  }, [isAuthenticated, user])

  // Load product details for local cart
  const loadLocalCartProducts = useCallback(async () => {
    const productIds = localCart.map((item) => item.productId)
    if (productIds.length === 0) return

    setIsLoading(true)
    try {
      const result = await getProductsByIds({ data: { ids: productIds } })
      if (result.success && result.data) {
        const productsMap: Record<number, any> = {}
        result.data.forEach((product: any) => {
          productsMap[product.id] = product
        })
        setLocalCartProducts(productsMap)
      }
    } finally {
      setIsLoading(false)
    }
  }, [localCart, setLocalCartProducts, setIsLoading])

  // Load cart from server
  const loadServerCart = useCallback(async () => {
    if (!isAuthenticated) return

    setIsLoading(true)
    try {
      const result = await getUserCart()
      if (result.success && result.data) {
        setServerCart(result.data.items || [])
        // Clear local products as we don't need them anymore
        setLocalCartProducts({})
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, setServerCart, setLocalCartProducts, setIsLoading])

  // Add to cart
  const addToCart = useCallback(
    async ({ productId, quantity = 1, bidAmount }: AddToCartParams) => {
      if (!isAuthenticated) {
        // Guest cart - add to localStorage
        const existingItem = localCart.find(
          (item) => item.productId === productId,
        )

        if (existingItem) {
          // Update quantity
          setLocalCart((prev) =>
            prev.map((item) =>
              item.productId === productId
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            ),
          )
        } else {
          // Add new item
          const newItem: LocalCartItem = {
            productId,
            quantity,
            bidAmount,
            addedAt: new Date().toISOString(),
          }
          setLocalCart((prev) => [...prev, newItem])
        }

        // Fetch product info for the new item
        if (!localCartProducts[productId]) {
          const result = await getProductsByIds({ data: { ids: [productId] } })
          if (result.success && result.data && result.data[0]) {
            setLocalCartProducts((prev) => ({
              ...prev,
              [productId]: result.data[0],
            }))
          }
        }

        return { success: true }
      }

      // Authenticated cart - call server
      setIsLoading(true)
      try {
        const result = await addToCartAction({
          data: { productId, quantity, bidAmount },
        })
        if (result.success) {
          // Reload cart to get updated data with product info
          await loadServerCart()
        }
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [
      isAuthenticated,
      localCart,
      localCartProducts,
      setLocalCart,
      setLocalCartProducts,
      setIsLoading,
      loadServerCart,
    ],
  )

  // Update cart item
  const updateQuantity = useCallback(
    async ({ productId, quantity, bidAmount }: UpdateCartItemParams) => {
      if (!isAuthenticated) {
        if (quantity === 0) {
          // Remove item
          setLocalCart((prev) =>
            prev.filter((item) => item.productId !== productId),
          )
        } else {
          // Update quantity
          setLocalCart((prev) =>
            prev.map((item) =>
              item.productId === productId
                ? {
                    ...item,
                    quantity: quantity ?? item.quantity,
                    bidAmount: bidAmount ?? item.bidAmount,
                  }
                : item,
            ),
          )
        }
        return { success: true }
      }

      // Server update
      setIsLoading(true)
      try {
        const result = await updateCartItemAction({
          data: { productId, quantity, bidAmount },
        })
        if (result.success) {
          await loadServerCart()
        }
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, setLocalCart, setIsLoading, loadServerCart],
  )

  // Remove from cart
  const removeFromCart = useCallback(
    async (productId: number) => {
      if (!isAuthenticated) {
        setLocalCart((prev) =>
          prev.filter((item) => item.productId !== productId),
        )
        // Clean up product info
        setLocalCartProducts((prev) => {
          const newProducts = { ...prev }
          delete newProducts[productId]
          return newProducts
        })
        return { success: true }
      }

      setIsLoading(true)
      try {
        const result = await removeFromCartAction({ data: { productId } })
        if (result.success) {
          await loadServerCart()
        }
        return result
      } finally {
        setIsLoading(false)
      }
    },
    [
      isAuthenticated,
      setLocalCart,
      setLocalCartProducts,
      setIsLoading,
      loadServerCart,
    ],
  )

  // Clear entire cart
  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      setLocalCart([])
      setLocalCartProducts({})
      return { success: true }
    }

    setIsLoading(true)
    try {
      const result = await clearCartAction()
      if (result.success) {
        setServerCart([])
      }
      return result
    } finally {
      setIsLoading(false)
    }
  }, [
    isAuthenticated,
    setLocalCart,
    setLocalCartProducts,
    setServerCart,
    setIsLoading,
  ])

  // Sync local cart to server (called after login)
  const syncCart = useCallback(async () => {
    if (!isAuthenticated || localCart.length === 0) {
      return { success: false, data: { mergedCount: 0, conflicts: [] } }
    }

    setIsSyncing(true)
    try {
      const result = await syncCartAction({ data: { items: localCart } })
      if (result.success) {
        // Clear local cart after successful sync
        setLocalCart([])
        setLocalCartProducts({})
        // Reload server cart
        await loadServerCart()
      }
      return result
    } finally {
      setIsSyncing(false)
    }
  }, [
    isAuthenticated,
    localCart,
    setLocalCart,
    setLocalCartProducts,
    setIsSyncing,
    loadServerCart,
  ])

  return {
    // State
    cart,
    itemCount,
    total,
    isLoading,
    isSyncing,
    hasItems,
    validation,

    // Actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    syncCart,
    loadServerCart,

    // Utilities
    isInCart,
    getCartItem,
  }
}
