import { useAtom, useSetAtom, useAtomValue } from 'jotai'
import { useCallback, useEffect, useRef } from 'react'
import {
  highlightStateAtom,
  highlightConfigAtom,
  activeHighlightsAtom,
  highlightHistoryAtom,
  highlightsDismissedAtom,
  failedAttemptsAtom,
} from '../atoms/highlight.atoms'
import type { HighlightIntent } from '../types/highlight.types'

const MAX_RETRY_ATTEMPTS = 2
const HISTORY_SIZE = 10

export function useHighlightStateMachine() {
  const [state, setState] = useAtom(highlightStateAtom)
  const config = useAtomValue(highlightConfigAtom)
  const setActiveHighlights = useSetAtom(activeHighlightsAtom)
  const [history, setHistory] = useAtom(highlightHistoryAtom)
  const isDismissed = useAtomValue(highlightsDismissedAtom)
  const [failedAttempts, setFailedAttempts] = useAtom(failedAttemptsAtom)

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  // Check if intent is in recent history (prevent loops)
  const isInRecentHistory = useCallback(
    (intent: HighlightIntent) => {
      const key = intent.type === 'cart' ? intent.itemId : intent.slug
      return history.some((h) => {
        const hKey = h.type === 'cart' ? h.itemId : h.slug
        return hKey === key
      })
    },
    [history],
  )

  // Check retry attempts
  const canRetry = useCallback(
    (intent: HighlightIntent) => {
      const key = intent.type === 'cart' ? intent.itemId : intent.slug
      const attempts = failedAttempts.get(key) || 0
      return attempts < MAX_RETRY_ATTEMPTS
    },
    [failedAttempts],
  )

  // Transition to failed state
  const transitionToFailed = useCallback(
    (reason: string, intent: HighlightIntent, fallback?: string) => {
      cleanup()

      const key = intent.type === 'cart' ? intent.itemId : intent.slug
      setFailedAttempts((prev) => {
        const next = new Map(prev)
        next.set(key, (prev.get(key) || 0) + 1)
        return next
      })

      setState({ status: 'failed', intent, reason, fallback })

      setTimeout(() => {
        setState({ status: 'idle' })
      }, 2000)
    },
    [setState, setFailedAttempts, cleanup],
  )

  // Start highlight process
  const startHighlight = useCallback(
    (intent: HighlightIntent) => {
      // Guards
      if (isDismissed) {
        console.log('[Highlight] User has dismissed highlights')
        return false
      }

      if (isInRecentHistory(intent)) {
        console.log('[Highlight] Intent in recent history, skipping')
        return false
      }

      if (!canRetry(intent)) {
        console.log('[Highlight] Max retries reached for this intent')
        return false
      }

      // Check for reduced motion preference
      if (
        config.respectReducedMotion &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        console.log(
          '[Highlight] Reduced motion detected, using simple highlight',
        )
      }

      // Initialize
      cleanup()
      abortControllerRef.current = new AbortController()

      setState({ status: 'locating', intent })

      // Add to history
      setHistory((prev) => [...prev.slice(-HISTORY_SIZE + 1), intent])

      // Start timeout
      timeoutRef.current = setTimeout(() => {
        const currentState = state
        if (
          currentState.status === 'locating' ||
          currentState.status === 'navigating'
        ) {
          transitionToFailed('Timeout exceeded', intent)
        }
      }, config.maxNavigationTime + config.maxLocationTime)

      return true
    },
    [
      isDismissed,
      isInRecentHistory,
      canRetry,
      config,
      setState,
      setHistory,
      cleanup,
      state,
      transitionToFailed,
    ],
  )

  // Transition to navigating
  const transitionToNavigating = useCallback(
    (intent: HighlightIntent, destination: string) => {
      setState({ status: 'navigating', intent, destination })
    },
    [setState],
  )

  // Transition to completed
  const transitionToCompleted = useCallback(
    (intent: HighlightIntent) => {
      cleanup()
      setState({ status: 'completed', intent })

      const key = intent.type === 'cart' ? intent.itemId : intent.slug
      setActiveHighlights((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })

      setTimeout(() => {
        setState({ status: 'idle' })
      }, 100)
    },
    [setState, setActiveHighlights, cleanup],
  )

  // Transition to highlighting
  const transitionToHighlighting = useCallback(
    (intent: HighlightIntent, elementId: string) => {
      cleanup()
      setState({ status: 'highlighting', intent, elementId })

      const key = intent.type === 'cart' ? intent.itemId : intent.slug
      setActiveHighlights((prev) => new Set(prev).add(key))

      // Auto-complete after duration
      timeoutRef.current = setTimeout(() => {
        transitionToCompleted(intent)
      }, config.duration)
    },
    [
      setState,
      setActiveHighlights,
      config.duration,
      cleanup,
      transitionToCompleted,
    ],
  )

  // Abort current operation
  const abort = useCallback(() => {
    cleanup()
    setState({ status: 'idle' })
  }, [cleanup, setState])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    state,
    startHighlight,
    transitionToNavigating,
    transitionToHighlighting,
    transitionToCompleted,
    transitionToFailed,
    abort,
    isProcessing:
      state.status !== 'idle' &&
      state.status !== 'completed' &&
      state.status !== 'failed',
  }
}
