import { useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { localCartAtom } from '../atoms/cart.atom'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCart } from './use-cart'

export function useCartPersistence() {
  const { isAuthenticated } = useAuth()
  const localCart = useAtomValue(localCartAtom)
  const { syncCart, loadServerCart } = useCart()
  const hasSynced = useRef(false)

  // Auto-sync cart when user logs in
  useEffect(() => {
    if (isAuthenticated && localCart.length > 0 && !hasSynced.current) {
      hasSynced.current = true
      syncCart()
    }
  }, [isAuthenticated, localCart.length, syncCart])

  // Load server cart on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadServerCart()
    }
  }, [isAuthenticated, loadServerCart])

  // Reset sync flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasSynced.current = false
    }
  }, [isAuthenticated])
}
