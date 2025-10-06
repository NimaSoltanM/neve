// features/shared/highlight/atoms/highlight.atoms.ts

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type {
  HighlightState,
  HighlightConfig,
  HighlightIntent,
} from '../types/highlight.types'
import { DEFAULT_HIGHLIGHT_CONFIG } from '../types/highlight.types'

// Main state atom
export const highlightStateAtom = atom<HighlightState>({ status: 'idle' })

// Config atom (persisted to localStorage for user preferences)
export const highlightConfigAtom = atomWithStorage<HighlightConfig>(
  'highlight-config',
  DEFAULT_HIGHLIGHT_CONFIG,
)

// Track active highlights to prevent conflicts - FIX: Explicitly type the Set
export const activeHighlightsAtom = atom<Set<string>>(new Set<string>())

// History of recent highlights (for debugging and preventing loops)
export const highlightHistoryAtom = atom<HighlightIntent[]>([])

// Derived atom to check if highlighting is active
export const isHighlightingAtom = atom((get) => {
  const state = get(highlightStateAtom)
  return state.status === 'highlighting' || state.status === 'navigating'
})

// Derived atom for current intent
export const currentIntentAtom = atom<HighlightIntent | null>((get) => {
  const state = get(highlightStateAtom)
  if (state.status === 'idle') return null
  return state.intent
})

// Atom to track if user has dismissed highlights (session only)
export const highlightsDismissedAtom = atom(false)

// Atom to track failed attempts (prevent infinite retries) - FIX: Explicitly type the Map
export const failedAttemptsAtom = atom<Map<string, number>>(
  new Map<string, number>(),
)
