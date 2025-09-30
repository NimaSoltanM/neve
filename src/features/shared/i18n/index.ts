import type { Locale } from './constants'
import type { Translations } from './types'
import en from './translations/en'
import fa from './translations/fa'
export { I18nProvider, useI18n } from './context'
export { LanguageSwitcher } from './components/language-switcher'
export { isRTL, DEFAULT_LOCALE, LOCALES } from './constants'
export type { Locale } from './constants'
export type { Translations, TranslationParams } from './types'

export const translations: Record<Locale, Translations> = {
  en,
  fa,
}
