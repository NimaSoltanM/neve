import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import {
  getStoredLocale,
  setStoredLocale,
  interpolate,
  getNestedTranslation,
} from './utils'
import { isRTL } from './constants'
import { loadTranslations } from './translations'
import type { Locale } from './constants'
import type { Translations } from './types'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: any) => string
  dir: 'ltr' | 'rtl'
  isLoading: boolean
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale)
  const [translations, setTranslations] = useState<Translations | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load translations for current locale
  useEffect(() => {
    let cancelled = false

    setIsLoading(true)
    loadTranslations(locale).then((trans) => {
      if (!cancelled) {
        setTranslations(trans)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [locale])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setStoredLocale(newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = isRTL(newLocale) ? 'rtl' : 'ltr'
  }, [])

  const t = useCallback(
    (key: string, params?: any) => {
      if (!translations) {
        // Fallback to key while loading
        return key
      }

      const translation = getNestedTranslation(translations, key)

      if (!translation) {
        console.warn(`Translation missing for key: ${key} in locale: ${locale}`)
        return key
      }

      return interpolate(translation, params)
    },
    [locale, translations],
  )

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr'
  }, [locale])

  const value: I18nContextValue = {
    locale,
    setLocale,
    t,
    dir: isRTL(locale) ? 'rtl' : 'ltr',
    isLoading,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
