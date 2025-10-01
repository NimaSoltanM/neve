import { useI18n as useI18nBase } from './context'
import type { Translations } from './types'

// Type-safe translation hook
export function useI18n() {
  const base = useI18nBase()

  // Create a type-safe t function
  const t = <K extends keyof Translations, NK extends keyof Translations[K]>(
    key: `${K}.${string & NK}`,
    params?: Record<string, string | number>,
  ): string => {
    return base.t(key, params)
  }

  return {
    ...base,
    t,
  }
}

export { useI18nBase }
