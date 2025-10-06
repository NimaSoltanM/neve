// features/shared/highlight/components/smart-link.tsx

import { Link, useNavigate, useLocation } from '@tanstack/react-router'
import { useCallback, forwardRef } from 'react'
import { useHighlightStateMachine } from '../hooks/use-highlight-state-machine'
import {
  parseHighlightUrl,
  canHighlightOnCurrentPage,
} from '../utils/url-parser'
import { findProductLocation } from '../actions/find-product-location'
import { toast } from 'sonner'

type SmartLinkProps = React.ComponentPropsWithRef<typeof Link> & {
  fallbackBehavior?: 'navigate' | 'toast' | 'none'
  onHighlightStart?: () => void
  onHighlightEnd?: () => void
}

export const SmartLink = forwardRef<HTMLAnchorElement, SmartLinkProps>(
  (
    {
      to,
      children,
      onClick,
      fallbackBehavior = 'navigate',
      onHighlightStart,
      onHighlightEnd,
      ...props
    },
    ref,
  ) => {
    const navigate = useNavigate()
    const location = useLocation()
    const {
      startHighlight,
      transitionToNavigating,
      transitionToHighlighting,
      transitionToFailed,
    } = useHighlightStateMachine()

    const handleClick = useCallback(
      async (e: React.MouseEvent<HTMLAnchorElement>) => {
        // If no 'to' prop, let normal link behavior happen
        if (!to) {
          onClick?.(e)
          return
        }

        // Parse the destination URL
        const href = typeof to === 'string' ? to : String(to)
        const url = new URL(href, window.location.origin)
        const intent = parseHighlightUrl(url.pathname, url.searchParams)

        // If not a special URL, let normal navigation happen
        if (!intent) {
          onClick?.(e)
          return
        }

        // Prevent default navigation for special URLs
        e.preventDefault()

        // Call original onClick if provided
        onClick?.(e)

        // Notify start
        onHighlightStart?.()

        // Start highlight process
        const started = startHighlight(intent)
        if (!started) {
          // Highlight was rejected (dismissed, in history, etc.)
          if (fallbackBehavior === 'navigate') {
            // Navigate normally without highlight
            navigate({ to: href as any })
          } else if (fallbackBehavior === 'toast') {
            toast.info('Navigation cancelled')
          }
          return
        }

        try {
          if (intent.type === 'cart') {
            // Cart highlighting is simpler - just open drawer
            // The cart drawer will handle the highlighting
            transitionToHighlighting(intent, `cart-item-${intent.itemId}`)

            // Update URL to show cart is open (without navigation)
            const params = new URLSearchParams(location.search as any)
            params.set('cart', 'open')
            if (intent.itemId !== '__open__') {
              params.set('highlightItem', intent.itemId)
            }
            window.history.replaceState(
              {},
              '',
              `${location.pathname}?${params.toString()}`,
            )
          } else if (intent.type === 'product') {
            // Find where the product is - FIX: Call server function directly
            const productLocation = await findProductLocation(
              {
                slug: intent.slug,
                preferredContext: 'category',
              } as any, // Type assertion needed due to server function typing
            )

            if (!productLocation.found) {
              // Product not found
              const message = productLocation.suggestions?.length
                ? `Product not found. Did you mean: ${productLocation.suggestions[0].name}?`
                : 'Product not found'

              transitionToFailed(
                message,
                intent,
                productLocation.suggestions?.[0]?.slug,
              )

              if (fallbackBehavior === 'navigate') {
                // Try to search for it
                navigate({
                  to: '/marketplace',
                  search: {
                    page: 1,
                    search: intent.slug.replace(/-/g, ' '),
                  } as any,
                })
              } else if (fallbackBehavior === 'toast') {
                toast.error(message)
              }
              return
            }

            // Check if we need to navigate
            const canHighlightHere = canHighlightOnCurrentPage(
              location.pathname,
              intent,
            )

            if (!canHighlightHere) {
              // Navigate to the product location
              transitionToNavigating(intent, productLocation.route)

              // Convert search params - numbers to strings for URL
              const searchParams: Record<string, string> = {}
              for (const [key, value] of Object.entries(
                productLocation.search,
              )) {
                searchParams[key] = String(value)
              }

              await navigate({
                to: productLocation.route as any,
                params: productLocation.params as any,
                search: searchParams as any,
              })
            } else {
              // We're already on a page that can show this product
              // Just add highlight params
              const currentSearch = location.search as Record<string, any>

              await navigate({
                to: '.',
                search: {
                  ...currentSearch,
                  highlight: intent.slug,
                } as any,
              })
            }

            // Transition to highlighting (will be picked up by product card)
            setTimeout(() => {
              transitionToHighlighting(intent, `product-${intent.slug}`)
            }, 100) // Small delay to ensure DOM is ready
          }
        } catch (error) {
          console.error('[SmartLink] Error:', error)
          transitionToFailed(
            error instanceof Error ? error.message : 'Navigation failed',
            intent,
          )

          if (fallbackBehavior === 'toast') {
            toast.error('Failed to highlight item')
          }
        } finally {
          onHighlightEnd?.()
        }
      },
      [
        to,
        onClick,
        startHighlight,
        transitionToNavigating,
        transitionToHighlighting,
        transitionToFailed,
        navigate,
        location,
        fallbackBehavior,
        onHighlightStart,
        onHighlightEnd,
      ],
    )

    // If no 'to' prop, render nothing
    if (!to) {
      return null
    }

    // Parse the href to check if it's a special URL
    const href = typeof to === 'string' ? to : String(to)
    const url = new URL(href, window.location.origin)
    const isSpecialUrl =
      parseHighlightUrl(url.pathname, url.searchParams) !== null

    if (isSpecialUrl) {
      // FIX: Handle function children for native anchor
      const renderedChildren =
        typeof children === 'function'
          ? children({ isActive: false, isTransitioning: false })
          : children

      return (
        <a ref={ref} href={href} onClick={handleClick} {...props}>
          {renderedChildren}
        </a>
      )
    }

    // For normal URLs, use regular Link
    return (
      <Link ref={ref} to={to} onClick={onClick} {...props}>
        {children}
      </Link>
    )
  },
)

SmartLink.displayName = 'SmartLink'
