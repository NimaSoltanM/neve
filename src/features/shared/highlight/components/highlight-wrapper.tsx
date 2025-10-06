// features/shared/highlight/components/highlight-wrapper.tsx

import { useEffect, useRef, useState, forwardRef } from 'react'
import { useAtomValue } from 'jotai'
import {
  currentIntentAtom,
  highlightConfigAtom,
} from '../atoms/highlight.atoms'
import { cn } from '@/lib/utils'
import type { HighlightType } from '../types/highlight.types'

interface HighlightWrapperProps {
  id: string
  type?: HighlightType
  children: React.ReactNode
  className?: string
  onHighlightEnd?: () => void
  scrollIntoView?: boolean
}

export const HighlightWrapper = forwardRef<
  HTMLDivElement,
  HighlightWrapperProps
>(
  (
    {
      id,
      type = 'ring',
      children,
      className,
      onHighlightEnd,
      scrollIntoView = true,
    },
    ref,
  ) => {
    const currentIntent = useAtomValue(currentIntentAtom)
    const config = useAtomValue(highlightConfigAtom)
    const [isHighlighting, setIsHighlighting] = useState(false)
    const elementRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null) // FIX: Add initial value

    // Combine refs
    const setRefs = (el: HTMLDivElement | null) => {
      elementRef.current = el
      if (ref) {
        if (typeof ref === 'function') ref(el)
        else ref.current = el
      }
    }

    useEffect(() => {
      // Check if this element should be highlighted
      const shouldHighlight =
        (currentIntent?.type === 'cart' &&
          id === `cart-item-${currentIntent.itemId}`) ||
        (currentIntent?.type === 'product' &&
          id === `product-${currentIntent.slug}`)

      if (shouldHighlight) {
        // Start highlighting
        setIsHighlighting(true)

        // Scroll into view if needed
        if (scrollIntoView && elementRef.current) {
          const element = elementRef.current
          const rect = element.getBoundingClientRect()
          const isInViewport =
            rect.top >= 0 && rect.bottom <= window.innerHeight

          if (!isInViewport) {
            element.scrollIntoView({
              behavior: config.scrollBehavior,
              block: 'center',
            })
          }
        }

        // Auto-stop after duration
        timeoutRef.current = setTimeout(() => {
          setIsHighlighting(false)
          onHighlightEnd?.()
        }, config.duration)
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [currentIntent, id, config, scrollIntoView, onHighlightEnd])

    // Check for reduced motion
    const prefersReducedMotion =
      config.respectReducedMotion &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const animationClass = prefersReducedMotion
      ? 'highlight-simple'
      : `highlight-${type}`

    return (
      <div
        ref={setRefs}
        className={cn(
          'relative transition-all',
          isHighlighting && animationClass,
          className,
        )}
        data-highlighting={isHighlighting}
      >
        {children}
      </div>
    )
  },
)

HighlightWrapper.displayName = 'HighlightWrapper'
