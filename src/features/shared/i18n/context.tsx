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
import type { Locale } from './constants'
import type { TranslationParams } from './types'
import { translations } from './'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: TranslationParams) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

interface I18nProviderProps {
  children: ReactNode
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getStoredLocale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setStoredLocale(newLocale)
    document.documentElement.lang = newLocale
    document.documentElement.dir = isRTL(newLocale) ? 'rtl' : 'ltr'
  }, [])

  const t = useCallback(
    (key: string, params?: TranslationParams) => {
      const translation = getNestedTranslation(translations[locale], key)

      if (!translation) {
        console.warn(`Translation missing for key: ${key} in locale: ${locale}`)
        return key
      }

      return interpolate(translation, params)
    },
    [locale],
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
