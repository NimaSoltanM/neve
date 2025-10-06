import type { HighlightIntent } from '../types/highlight.types'
export function parseHighlightUrl(
  pathname: string,
  search?: URLSearchParams,
): HighlightIntent | null {
  // Cart patterns
  if (pathname === '/cart' || pathname.startsWith('/cart/')) {
    const itemId = search?.get('item') || search?.get('highlight')
    if (itemId) {
      return {
        type: 'cart',
        itemId,
        productId: search?.get('product'), // Optional product ID for validation
      }
    }
    // Just open cart without highlighting specific item
    return {
      type: 'cart',
      itemId: '__open__', // Special ID to just open drawer
    }
  }

  // Product patterns
  const productMatch = pathname.match(/^\/products?\/([^/]+)/)
  if (productMatch) {
    const slug = productMatch[1]
    return {
      type: 'product',
      slug,
      fallbackSearch: search?.get('search') || undefined,
    }
  }

  return null
}

/**
 * Check if we're already on a page that can show the highlight
 */
export function canHighlightOnCurrentPage(
  currentPath: string,
  intent: HighlightIntent,
): boolean {
  if (intent.type === 'cart') {
    // Cart can be highlighted from any page
    return true
  }

  if (intent.type === 'product') {
    // Check if we're on a page that might contain this product
    return (
      currentPath.includes('/marketplace') ||
      currentPath.includes('/categories') ||
      currentPath.includes('/shops') ||
      currentPath === '/'
    )
  }

  return false
}

/**
 * Generate the appropriate URL for a highlight intent
 */
export function generateHighlightUrl(
  intent: HighlightIntent,
  location?: {
    route: string
    params: Record<string, string>
    search: Record<string, any>
  },
): string {
  if (intent.type === 'cart') {
    // Always use the current page with highlight param
    const params = new URLSearchParams(window.location.search)
    params.set('highlightCart', intent.itemId)
    return `${window.location.pathname}?${params.toString()}`
  }

  if (intent.type === 'product' && location) {
    // Build the URL from location data
    let url = location.route

    // Replace params in route
    for (const [key, value] of Object.entries(location.params)) {
      url = url.replace(`$${key}`, value)
    }

    // Add search params
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(location.search)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value))
      }
    }

    return searchParams.toString() ? `${url}?${searchParams.toString()}` : url
  }

  // Fallback - just return current URL
  return window.location.href
}
