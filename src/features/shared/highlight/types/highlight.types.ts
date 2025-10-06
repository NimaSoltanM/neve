// features/shared/highlight/types/highlight.types.ts

export type HighlightType = 'pulse' | 'ring' | 'glow' | 'bounce'

export type HighlightIntent =
  | { type: 'cart'; itemId: string; productId?: string }
  | { type: 'product'; slug: string; fallbackSearch?: string }

export type HighlightState =
  | { status: 'idle' }
  | { status: 'locating'; intent: HighlightIntent }
  | { status: 'navigating'; intent: HighlightIntent; destination: string }
  | { status: 'highlighting'; intent: HighlightIntent; elementId: string }
  | { status: 'completed'; intent: HighlightIntent }
  | {
      status: 'failed'
      intent: HighlightIntent
      reason: string
      fallback?: string
    }

export type HighlightConfig = {
  duration: number // Animation duration in ms
  intensity: number // 0-1 for animation intensity
  scrollBehavior: 'smooth' | 'instant'
  scrollOffset: number // Pixels from top when scrolling
  respectReducedMotion: boolean
  maxNavigationTime: number // Timeout for navigation
  maxLocationTime: number // Timeout for finding location
}

export const DEFAULT_HIGHLIGHT_CONFIG: HighlightConfig = {
  duration: 3000,
  intensity: 1,
  scrollBehavior: 'smooth',
  scrollOffset: 100,
  respectReducedMotion: true,
  maxNavigationTime: 3000,
  maxLocationTime: 2000,
}

export type ProductLocation =
  | {
      found: true
      route: string
      params: Record<string, string>
      search: Record<string, any>
      context: 'marketplace' | 'category' | 'shop' | 'search'
    }
  | {
      found: false
      suggestions?: Array<{
        name: string
        slug: string
        similarity: number
      }>
    }
