import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n'
import { PREVIEW_FEATURES, type PreviewState } from '../types'

const STORAGE_KEY = 'preview-mode'
const FIRST_VISIT_KEY = 'first-visit'

export function usePreviewMode() {
  const navigate = useNavigate()
  const { locale, setLocale } = useI18n()

  const [state, setState] = useState<PreviewState>(() => {
    const firstVisit = localStorage.getItem(FIRST_VISIT_KEY)
    const saved = localStorage.getItem(STORAGE_KEY)

    if (!firstVisit) {
      localStorage.setItem(FIRST_VISIT_KEY, Date.now().toString())
      return { isOpen: true, explored: [] }
    }

    if (saved) {
      return JSON.parse(saved)
    }

    return { isOpen: false, explored: [] }
  })

  const dismiss = useCallback(() => {
    const newState = { ...state, isOpen: false }
    setState(newState)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
  }, [state])

  const reopen = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: true }))
  }, [])

  const markExplored = useCallback((featureId: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        explored: prev.explored.includes(featureId)
          ? prev.explored
          : [...prev.explored, featureId],
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
      return newState
    })
  }, [])

  const executeAction = useCallback(
    async (feature: (typeof PREVIEW_FEATURES)[0]) => {
      markExplored(feature.id)

      switch (feature.action.type) {
        case 'navigate':
          if (feature.action.to) {
            navigate({ to: feature.action.to })
          }
          break

        case 'toggle-lang':
          setLocale(locale === 'en' ? 'fa' : 'en')
          break
      }
    },
    [navigate, locale, setLocale, markExplored],
  )

  return {
    isOpen: state.isOpen,
    explored: state.explored,
    features: PREVIEW_FEATURES,
    dismiss,
    reopen,
    executeAction,
  }
}
