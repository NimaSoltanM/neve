// src/features/preview-mode/atoms.ts

import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import type { PreviewState } from './types'

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined'

// Track if first visit (only on client)
const FIRST_VISIT_KEY = 'portfolio-first-visit'

const checkFirstVisit = () => {
  if (!isBrowser) return false

  const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY)
  if (isFirstVisit) {
    localStorage.setItem(FIRST_VISIT_KEY, Date.now().toString())
  }
  return isFirstVisit
}

// Initialize with function to avoid SSR issues
const getInitialState = (): PreviewState => {
  if (!isBrowser) {
    return { isOpen: false, explored: [] }
  }

  return {
    isOpen: checkFirstVisit(),
    explored: [],
  }
}

// Main preview state
export const previewStateAtom = atomWithStorage<PreviewState>(
  'portfolio-preview',
  getInitialState(),
  undefined,
  { getOnInit: true }, // Only get from storage on client init
)

// Derived atoms remain the same
export const isPreviewOpenAtom = atom(
  (get) => get(previewStateAtom).isOpen,
  (get, set, isOpen: boolean) => {
    set(previewStateAtom, { ...get(previewStateAtom), isOpen })
  },
)

export const exploredFeaturesAtom = atom(
  (get) => get(previewStateAtom).explored,
)

export const markExploredAtom = atom(null, (get, set, featureId: string) => {
  const current = get(previewStateAtom)
  if (!current.explored.includes(featureId)) {
    set(previewStateAtom, {
      ...current,
      explored: [...current.explored, featureId],
    })
  }
})

export const resetPreviewAtom = atom(null, (get, set) => {
  set(previewStateAtom, {
    isOpen: true,
    explored: [],
  })
})
