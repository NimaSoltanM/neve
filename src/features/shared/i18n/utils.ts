import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from './constants'
import type { Locale } from './constants'

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE

  const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'en' || stored === 'fa') {
    return stored
  }
  return DEFAULT_LOCALE
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  }
}

export function getNestedTranslation(
  obj: any,
  path: string,
): string | undefined {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current?.[key] === undefined) {
      return undefined
    }
    current = current[key]
  }

  return typeof current === 'string' ? current : undefined
}

export function interpolate(text: string, params?: any): string {
  if (!params) return text

  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key]?.toString() || match
  })
}
