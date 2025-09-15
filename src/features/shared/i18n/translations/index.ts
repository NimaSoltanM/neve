import type { Locale } from '../constants'
import type { Translations } from '../types'

// Lazy load translations
export async function loadTranslations(locale: Locale): Promise<Translations> {
  switch (locale) {
    case 'en':
      return (await import('./en')).default
    case 'fa':
      return (await import('./fa')).default
    default:
      return (await import('./en')).default
  }
}
