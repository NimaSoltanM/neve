import { useCallback } from 'react'
import { useCart } from './use-cart'

export function useCartItem(productId: number) {
  const { getCartItem, isInCart, addToCart, updateQuantity, removeFromCart } =
    useCart()

  const item = getCartItem(productId)
  const inCart = isInCart(productId)
  const quantity = item?.quantity ?? 0

  const increment = useCallback(() => {
    if (!inCart) {
      return addToCart({ productId, quantity: 1 })
    }
    return updateQuantity({ productId, quantity: quantity + 1 })
  }, [inCart, productId, quantity, addToCart, updateQuantity])

  const decrement = useCallback(() => {
    if (quantity <= 1) {
      return removeFromCart(productId)
    }
    return updateQuantity({ productId, quantity: quantity - 1 })
  }, [productId, quantity, updateQuantity, removeFromCart])

  const setQuantity = useCallback(
    (newQuantity: number) => {
      if (newQuantity <= 0) {
        return removeFromCart(productId)
      }
      if (!inCart) {
        return addToCart({ productId, quantity: newQuantity })
      }
      return updateQuantity({ productId, quantity: newQuantity })
    },
    [inCart, productId, addToCart, updateQuantity, removeFromCart],
  )

  return {
    item,
    inCart,
    quantity,
    increment,
    decrement,
    setQuantity,
    remove: () => removeFromCart(productId),
  }
}
