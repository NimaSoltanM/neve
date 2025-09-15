export const LOCALES = ['en', 'fa'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'app-locale'

export const RTL_LOCALES: Locale[] = ['fa']
export const isRTL = (locale: Locale) => RTL_LOCALES.includes(locale)
